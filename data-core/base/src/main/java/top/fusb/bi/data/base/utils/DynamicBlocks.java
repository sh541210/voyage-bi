package top.fusb.bi.data.base.utils;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class DynamicBlocks {
    public static final String regex = "\\$\\{(.*?)}";

    // 动态块匹配正则（支持多行）
    private static final Pattern DYNAMIC_BLOCK_PATTERN =
            Pattern.compile("!\\{(.*?)}!", Pattern.DOTALL);

    // 正确转义的正则表达式
    private static final Pattern CONDITION_PATTERN = Pattern.compile(
            "@if\\s*\\(" +       // @if(
                    "([^)]+)" +              // 条件表达式（排除右括号）
                    "\\)\\s*" +          // ) 及后续空白
                    "((?:(?!@elif|@else|}!).)*)", // 捕获SQL片段
            Pattern.DOTALL
    );

    private static final Pattern ELSE_IF_PATTERN =
            Pattern.compile("@elif\\s*\\(" +
                    "(.+?)" +
                    "\\)\\s*" +
                    "((?:(?!@elif|@else).)*)", Pattern.DOTALL | Pattern.CASE_INSENSITIVE);

    private static final Pattern ELSE_PATTERN =
            Pattern.compile("@else\\s*" +
                    "((?:(?!@if|@elif).)*)", Pattern.DOTALL);

    /**
     * 处理包含动态块的 SQL
     */
    public static String processDynamicBlocks(String sql, Map<String, Object> params) {
        Matcher blockMatcher = DYNAMIC_BLOCK_PATTERN.matcher(sql);
        StringBuilder result = new StringBuilder();
        Set<String> variables = extractVariables(sql);
        Map<String, Object> parameters = new HashMap<>(params);
        variables.forEach(i -> {
            if (!parameters.containsKey(i)) {
                parameters.put(i, null);
            }
        });

        while (blockMatcher.find()) {
            String dynamicContent = blockMatcher.group(1);
            String processed = evaluateDynamicBlock(dynamicContent, parameters);
            String escapedProcessed = Matcher.quoteReplacement(processed);
            blockMatcher.appendReplacement(result, escapedProcessed);
        }
        blockMatcher.appendTail(result);

        return result.toString();
    }

    /**
     * 评估动态块内容
     */
    private static String evaluateDynamicBlock(String content, Map<String, Object> params) {
        // 解析所有条件分支
        List<ConditionBranch> branches = new ArrayList<>();

        // 解析 @if
        Matcher ifMatcher = CONDITION_PATTERN.matcher(content);
        if (ifMatcher.find()) branches.add(new ConditionBranch(
                ifMatcher.group(1).trim(),
                ifMatcher.group(2).trim()
        ));

        // 解析 @elif
        Matcher elifMatcher = ELSE_IF_PATTERN.matcher(content);
        while (elifMatcher.find()) branches.add(new ConditionBranch(
                elifMatcher.group(1).trim(),
                elifMatcher.group(2).trim()
        ));

        // 解析 @else
        Matcher elseMatcher = ELSE_PATTERN.matcher(content);
        if (elseMatcher.find()) branches.add(new ConditionBranch(
                "true",  // 始终匹配
                elseMatcher.group(1).trim()
        ));

        // 遍历分支选择首个匹配项
        for (ConditionBranch branch : branches) if (evaluateExpression(branch.condition, params)) return branch.content;

        return "";
    }

    /**
     * 安全评估表达式
     */
    private static boolean evaluateExpression(String expr, Map<String, Object> context) {
        try {
            // 使用轻量级脚本引擎
            ScriptEngine engine = new ScriptEngineManager()
                    .getEngineByName("javascript");
            context.forEach(engine::put);
            // 执行并返回布尔结果
            return (boolean) engine.eval("function evalExpr() { return " + expr + "; } evalExpr();");
        } catch (ScriptException e) {
            throw new RuntimeException("!{...}!表达式评估失败: " + expr, e);
        }
    }

    /**
     * 条件分支封装类
     */
    private static class ConditionBranch {
        String condition;
        String content;

        ConditionBranch(String condition, String content) {
            this.condition = condition;
            this.content = content;
        }
    }

    /**
     * 提取变量
     *
     * @param sql sql
     * @return 变量列表
     */
    public static Set<String> extractVariables(String sql) {
        Set<String> variables = new HashSet<>();

        // 提取 ${变量}
        Matcher matcher = Pattern.compile(regex).matcher(sql);
        while (matcher.find()) {
            variables.add(matcher.group(1));
        }

        // 提取动态块中的变量
        Matcher blockMatcher = DYNAMIC_BLOCK_PATTERN.matcher(sql);
        while (blockMatcher.find()) {
            String dynamicContent = blockMatcher.group(1);
            Matcher varMatcher = Pattern.compile("(?:(@if\\(|@elif\\()([\\u4e00-\\u9fa5a-zA-Z_]+)(?=\\s*[=><!]))")
                    .matcher(dynamicContent);
            while (varMatcher.find()) {
                variables.add(varMatcher.group(2));
            }
        }

        return variables;
    }
}
