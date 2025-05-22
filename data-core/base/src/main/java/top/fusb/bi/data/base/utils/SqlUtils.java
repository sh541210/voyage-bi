package top.fusb.bi.data.base.utils;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public class SqlUtils {
    public static String removeSemicolon(String text) {
        if (text != null) {
            text = text.trim();
            if (text.endsWith(";")) {
                text = text.substring(0, text.length() - 1).trim();
            }
        }
        return text + "\n";
    }

    public static String removePairedBackticks(String input) {
        if (input == null) {
            return null;
        }
        // 正则匹配成对的反引号，例如 `xxx` → xxx
        return input.replaceAll("`([^`]+)`", "$1");
    }

    public static String removeSqlComments(String sql) {
        StringBuilder result = new StringBuilder();
        boolean inString = false;
        boolean inComment = false;
        int length = sql.length();

        for (int i = 0; i < length; i++) {
            char current = sql.charAt(i);

            if (inComment) {
                // 遇到换行符时结束注释，并不保留换行符
                if (current == '\n' || current == '\r') {
                    inComment = false;
                    // 处理 Windows 换行符 \r\n
                    if (current == '\r' && i + 1 < length && sql.charAt(i + 1) == '\n') {
                        i++; // 跳过 \n
                    }
                }
                continue; // 跳过注释内容（含换行符）
            }

            if (inString) {
                if (current == '\'') {
                    // 处理单引号转义（两个单引号）
                    if (i + 1 < length && sql.charAt(i + 1) == '\'') {
                        result.append(current).append('\'');
                        i++; // 跳过下一个字符
                    } else {
                        inString = false;
                    }
                }
                result.append(current);
            } else {
                // 检查注释开始
                if (current == '-' && i + 1 < length && sql.charAt(i + 1) == '-') {
                    inComment = true;
                    i++; // 跳过第二个 '-'
                    continue;
                }
                // 检查字符串开始
                if (current == '\'') {
                    inString = true;
                }
                result.append(current);
            }
        }
        return Arrays.stream(result.toString().split("\n"))
                .filter(i -> !i.trim().isEmpty())
                .collect(Collectors.joining("\n"));
    }

    /**
     * toString
     *
     * @param value 源值
     * @param quota 是否增加引号
     * @return 目表值
     */
    public static String toStringValue(Object value, boolean quota) {
        if (value == null) return null;
        // 集合递归转成带括号字符串
        if (value instanceof List<?> list) {
            if (list.isEmpty()) return null;
            return "(" + list.stream().map(i -> toStringValue(i, true))
                    .collect(Collectors.joining(",")) + ")";
            // 字符串且需要引号
        } else if (value instanceof String && quota) return '"' + value.toString() + '"';
        else return Objects.toString(value);
    }
}
