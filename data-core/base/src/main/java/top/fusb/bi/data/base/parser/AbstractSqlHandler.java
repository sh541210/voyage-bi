package top.fusb.bi.data.base.parser;

import lombok.extern.slf4j.Slf4j;
import net.sf.jsqlparser.JSQLParserException;
import net.sf.jsqlparser.expression.Expression;
import net.sf.jsqlparser.parser.CCJSqlParserUtil;
import net.sf.jsqlparser.statement.Statement;
import net.sf.jsqlparser.statement.select.*;
import top.fusb.bi.data.base.domin.DatasourceType;
import top.fusb.bi.data.base.utils.SqlUtils;

import java.util.Collection;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Slf4j
public abstract class AbstractSqlHandler implements SqlHandler, SelectHandler {
    protected final DatasourceType dsType;
    private static final ExecutorService executor = Executors.newCachedThreadPool();
    private Integer timeoutSeconds = 5;

    static {
        Runtime.getRuntime().addShutdownHook(new Thread(executor::shutdownNow));
    }

    public AbstractSqlHandler timeoutSeconds(int value) {
        timeoutSeconds = value;
        return this;
    }

    public AbstractSqlHandler(DatasourceType dsType) {
        this.dsType = dsType;
    }

    @Override
    public String handleSQL(String sql) throws JSQLParserException {
        // 处理掉注释
        sql = SqlUtils.removeSqlComments(sql);
        // 去掉分号
        sql = SqlUtils.removeSemicolon(sql);
        // 解析SQL
        Statement statement = CCJSqlParserUtil.parse(sql, executor, parser -> {
            parser.withAllowComplexParsing(true)
                    .withTimeOut(timeoutSeconds * 1000L);
        });
        if (statement instanceof Select select) {
            handleSelect(select);
        }
//        if (select instanceof PlainSelect plainSelect) {
//            FromItem fromItem = plainSelect.getFromItem();
//            if (fromItem instanceof ParenthesedSelect) {
//                List<OrderByElement> orderByElements = ((ParenthesedSelect) fromItem).getSelect().getOrderByElements();
//                if (orderByElements != null) {
//                    plainSelect.setOrderByElements(orderByElements);
//                }
//            }
//        }
        return statement.toString().trim();
    }

    /**
     * 递归处理各处Select
     *
     * @param select select
     */
    protected void handleSelect(Select select) {
        if (select.getWithItemsList() != null) {
            List<WithItem<?>> withItems = select.getWithItemsList();
            for (WithItem<?> withItem : withItems) {
                handleSelect(withItem.getSelect());
            }
        }
        if (select instanceof ParenthesedSelect parenthesedSelect) {
            handleSelect(parenthesedSelect.getSelect());
        } else if (select instanceof SetOperationList setOperationList) {
            List<Select> selects = setOperationList.getSelects();
            if (selects != null) {
                for (Select subSelect : selects) {
                    handleSelect(subSelect);
                }
            }
        } else if (select instanceof PlainSelect plainSelect) {
            FromItem fromItem = plainSelect.getFromItem();
            if (fromItem instanceof ParenthesedSelect subSelect) {
                handleSelect(subSelect);
            }
            List<Join> joins = plainSelect.getJoins();
            if (joins != null) {
                for (Join join : joins) {
                    FromItem rightItem = join.getRightItem();
                    Collection<Expression> onExpressions = join.getOnExpressions();
                    if (onExpressions != null) {
                        // 处理 JOIN ON 表达式
                        List<Expression> expressions = onExpressions.stream().map(this::handleExpression).toList();
                        join.setOnExpressions(expressions);
                    }
                    if (rightItem instanceof ParenthesedSelect subSelect) {
                        handleSelect(subSelect);
                    }
                }
            }
            Expression expr = plainSelect.getWhere();
            if (expr != null) {
                // 处理 WHERE 表达式
                plainSelect.setWhere(handleExpression(expr));
            }
            // 处理 ORDER BY 子句
            if (plainSelect.getOrderByElements() != null) {
                for (OrderByElement orderByElement : plainSelect.getOrderByElements()) {
                    Expression expression = orderByElement.getExpression();
                    if (expression != null) {
                        orderByElement.setExpression(handleExpression(expression));
                    }
                }
            }
            handlePlainSelect(plainSelect);
        }
    }
}
