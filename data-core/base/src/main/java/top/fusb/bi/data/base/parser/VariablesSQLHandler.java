package top.fusb.bi.data.base.parser;

import lombok.Setter;
import net.sf.jsqlparser.JSQLParserException;
import net.sf.jsqlparser.expression.*;
import net.sf.jsqlparser.expression.operators.conditional.AndExpression;
import net.sf.jsqlparser.expression.operators.conditional.OrExpression;
import net.sf.jsqlparser.expression.operators.relational.*;
import net.sf.jsqlparser.parser.CCJSqlParserUtil;
import net.sf.jsqlparser.schema.Column;
import net.sf.jsqlparser.statement.select.ParenthesedSelect;
import net.sf.jsqlparser.statement.select.PlainSelect;
import top.fusb.bi.data.base.domin.DatasourceType;
import top.fusb.bi.data.base.utils.DynamicBlocks;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import static top.fusb.bi.data.base.utils.DynamicBlocks.regex;
import static top.fusb.bi.data.base.utils.SqlUtils.toStringValue;

/**
 * 变量SQL处理器
 */
public class VariablesSQLHandler extends AbstractSqlHandler implements SelectHandler {
    // 有效标识
    private static final String VALID_PH = "#VALID";
    // 无效标识
    private static final String INVALID_PH = "#INVALID";
    private static final Expression VALID_EXPRESSION;
    private static final Expression INVALID_EXPRESSION;
    private final Map<String, Object> variableValues;
    @Setter
    private SelectHandler sqlOptimizer;
    private boolean hasPh;

    static {
        try {
            VALID_EXPRESSION = CCJSqlParserUtil.parseCondExpression(" 1 = 1 ");
            INVALID_EXPRESSION = CCJSqlParserUtil.parseCondExpression(" 1 = 0 ");
        } catch (JSQLParserException e) {
            throw new RuntimeException(e);
        }
    }

    public VariablesSQLHandler(DatasourceType dsType,
                               Map<String, Object> variablesValues) {
        super(dsType);
        variableValues = variablesValues;
    }

    @Override
    public void handlePlainSelect(PlainSelect select) {
        if (sqlOptimizer != null) {
            sqlOptimizer.handlePlainSelect(select);
        }
    }

    @Override
    public String handleSQL(String sql) throws JSQLParserException {
        // 解析动态代码片段
        sql = DynamicBlocks.processDynamicBlocks(sql, variableValues.entrySet()
                .stream()
                .filter(entry -> entry.getValue() != null)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue)));
        // 设置变量占位符
        sql = setConditionPh(sql, variableValues);
        return super.handleSQL(sql);
    }

    private static boolean hasVariable(String sql) {
        return sql.contains(INVALID_PH) || sql.contains(VALID_PH);
    }

    private Expression replaceExpression(Expression expression) {
        if (expression instanceof ParenthesedSelect select) {
            handleSelect(select);
        }
        if (expression instanceof BinaryExpression binaryExpression) {
            Expression leftExpression = replaceExpression(binaryExpression.getLeftExpression());
            Expression rightExpression = replaceExpression(binaryExpression.getRightExpression());
            if (containsConditionPh(leftExpression, VALID_PH) ||
                    containsConditionPh(rightExpression, VALID_PH)) {
                return VALID_EXPRESSION;
            } else if (containsConditionPh(leftExpression, INVALID_PH) ||
                    containsConditionPh(rightExpression, INVALID_PH)) {
                return INVALID_EXPRESSION;
            }
            binaryExpression.setLeftExpression(leftExpression);
            binaryExpression.setRightExpression(rightExpression);
            if (!(expression instanceof AndExpression || expression instanceof OrExpression)) {
                if (leftExpression.equals(INVALID_EXPRESSION) || rightExpression.equals(INVALID_EXPRESSION)) {
                    return INVALID_EXPRESSION;
                }
                if (leftExpression.equals(VALID_EXPRESSION) || rightExpression.equals(VALID_EXPRESSION)) {
                    return VALID_EXPRESSION;
                }
            }
        } else if (expression instanceof ParenthesedExpressionList<?> list) {
            return new ParenthesedExpressionList<>(list.stream().map(this::replaceExpression).toList());
        } else if (expression instanceof Function function) {
            ExpressionList<?> parameters = function.getParameters();
            if (parameters != null) {
                List<Expression> expressions = parameters.stream().map(this::replaceExpression).toList();
                if (expressions.stream().anyMatch(i -> i.equals(INVALID_EXPRESSION))) {
                    return INVALID_EXPRESSION;
                } else if (expressions.stream().anyMatch(i -> i.equals(VALID_EXPRESSION))) {
                    return VALID_EXPRESSION;
                }
            }
        } else if (expression instanceof CaseExpression caseExpr) {
            caseExpr.getWhenClauses().forEach(when -> {
                        when.setWhenExpression(replaceExpression(when.getWhenExpression()));
                        when.setThenExpression(replaceExpression(when.getThenExpression()));
                    }
            );
            caseExpr.setElseExpression(replaceExpression(caseExpr.getElseExpression()));
        } else if (expression instanceof ExistsExpression existsExpression) {
            existsExpression.setRightExpression(replaceExpression(existsExpression.getRightExpression()));
        } else if (expression instanceof CastExpression castExpression) {
            castExpression.setLeftExpression(replaceExpression(castExpression.getLeftExpression()));
        } else {
            if (containsConditionPh(expression, VALID_PH)) {
                return VALID_EXPRESSION;
            } else if (containsConditionPh(expression, INVALID_PH)) {
                return INVALID_EXPRESSION;
            }
        }
        return expression;
    }

    /**
     * 递归替换条件表达式
     *
     * @param expression 原表达式
     * @return 替换后的表达式
     */
    @Override
    public Expression handleExpression(Expression expression) {
        if (hasPh) {
            expression = replaceExpression(expression);
        }
        if (sqlOptimizer != null) {
            return sqlOptimizer.handleExpression(expression);
        }
        return expression;
    }

    /**
     * 判断表达式是否包含标识
     *
     * @param expr        表达式
     * @param placeholder 标识
     * @return boolean
     */
    private boolean containsConditionPh(Expression expr, String placeholder) {
        return expr instanceof Column && expr.toString().equals(placeholder)
                || (expr instanceof StringValue && ((StringValue) expr).getValue().equals(placeholder))
                || (expr instanceof InExpression && ((InExpression) expr).getRightExpression().toString().equals(placeholder))
                || ((expr instanceof IsNullExpression && ((IsNullExpression) expr).getLeftExpression().toString().equals(placeholder)))
                || (expr instanceof LikeExpression && ((LikeExpression) expr).getRightExpression().toString().contains(placeholder));
    }


    /**
     * 设置条件标识符
     *
     * @param sql 原sql
     * @return 设置后的sql
     */
    private String setConditionPh(String sql, Map<String, Object> variableValues) {
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(sql);
        StringBuilder result = new StringBuilder();
        while (matcher.find()) {
            // 获取变量名
            String variableName = matcher.group(1).trim();
            // 替换变量值
            String replacement;
            // 无效变量，使用占位符替换
            if (variableValues != null && variableValues.containsKey(variableName)) {
                // 找到对应变量值并判断是否需要加引号
                Object rawValue = variableValues.get(variableName);
                if (rawValue != null) {
                    boolean hasQuota = matcher.start() > 0 &&
                            (sql.charAt(matcher.start() - 1) == '\'' || sql.charAt(matcher.start() - 1) == '"');
                    replacement = toStringValue(rawValue, !hasQuota);
                } else {
                    replacement = INVALID_PH;
                }
            } else {
                replacement = VALID_PH;
            }
            // 替换匹配到的变量
            matcher.appendReplacement(result, Matcher.quoteReplacement(replacement));
        }
        // 追加未匹配的部分
        matcher.appendTail(result);
        hasPh = hasVariable(result.toString());
        return result.toString();
    }
}
