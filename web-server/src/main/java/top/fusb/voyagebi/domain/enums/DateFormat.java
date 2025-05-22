package top.fusb.voyagebi.domain.enums;

/**
 * 日期格式枚举类型，用于表示不同的日期格式类型
 */
public enum DateFormat {
    /**
     * 月份格式
     */
    MONTH("DATE_FORMAT(DATE_ADD(%s, INTERVAL -1 * ((MONTH(%s)-1) %% %d) MONTH), '%%Y-%%m')"),

    /**
     * 周格式
     */
    // WEEK("DATE_FORMAT(DATE_ADD(%s, INTERVAL -1 * ((WEEK(%s,1)-1) %% %d) WEEK), '%%Y-%%u')"),
    // WEEK解析会报错，改为使用*7 DAY方式
    WEEK("DATE_FORMAT(DATE_ADD(%s, INTERVAL (-1 * ((WEEK(%s,1)-1) %% %d) * 7) DAY), '%%Y-%%u')"),

    /**
     * 日格式
     */
    DAY("DATE(DATE_ADD(%s, INTERVAL -1 * (DAY(%s) %% %d) DAY))"),

    /**
     * 年格式
     */
    YEAR("YEAR(DATE_ADD(%s, INTERVAL -1 * (YEAR(%s) %% %d) YEAR))"),

    /**
     * 小时格式
     */
    HOUR("DATE_FORMAT(DATE_ADD(%s, INTERVAL -1 * (HOUR(%s) %% %d) HOUR), '%%Y-%%m-%%d %%H:00')"),

    /**
     * 分钟
     */
    MINUTE("DATE_FORMAT(DATE_ADD(%s, INTERVAL -1 * (MINUTE(%s) %% %d) MINUTE), '%%Y-%%m-%%d %%H:%%i')");

    private final String formatPattern;

    DateFormat(String formatPattern) {
        this.formatPattern = formatPattern;
    }

    public String format(ValueType valueType, String field, int interval) {
        field = switch (valueType) {
            case Date -> field;
            case Long -> String.format(
                    "FROM_UNIXTIME(%s / (1 + 999 * (%s >= 1000000000000)))",
                    field, field
            );
            default -> "STR_TO_DATE(" + field + ", '%Y-%m-%d %H:%i:%s')";
        };
        return String.format(formatPattern, field, field, interval);
    }

    public enum ValueType {
        String, Date, Long
    }
}
