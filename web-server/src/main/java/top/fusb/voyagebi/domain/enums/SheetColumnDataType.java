package top.fusb.voyagebi.domain.enums;

/**
 * 表示数据列的类型。
 * <p>
 * 该枚举用于标识不同类型的数据列：数字、文本或日期。
 * </p>
 */
public enum SheetColumnDataType {

    /** 数字类型 */
    NUMBER,

    /** 文本类型 */
    TEXT,

    /** 日期类型 */
    DATE;

    /**
     * 根据数据库列类型字符串返回相应的枚举值。
     * <p>
     * 此方法用于根据数据库字段类型（如 `VARCHAR`、`INT` 等）来确定数据列的类型。
     * 会根据常见的数据库类型映射为相应的枚举：`NUMBER`、`TEXT` 或 `DATE`。
     * 如果传入的类型没有明确映射，则默认为 `TEXT`。
     * </p>
     *
     * @param columnType 数据库中的列类型字符串（如 "INT"、"VARCHAR"、"DATE"）
     * @return 对应的枚举值：`NUMBER`、`TEXT` 或 `DATE`
     */
    public static SheetColumnDataType ofColumnType(String columnType) {
        if ("INT".equalsIgnoreCase(columnType) || "BIGINT".equalsIgnoreCase(columnType)
                || "float".equalsIgnoreCase(columnType) || "Double".equalsIgnoreCase(columnType)
                || "BigDecimal".equalsIgnoreCase(columnType)
                || "Long".equalsIgnoreCase(columnType)
        ) {
            return NUMBER;  // 数字类型
        } else if ("VARCHAR".equalsIgnoreCase(columnType) || "STRING".equalsIgnoreCase(columnType)) {
            return TEXT;    // 文本类型
        } else if ("DATE".equalsIgnoreCase(columnType) || "TIMESTAMP".equalsIgnoreCase(columnType)) {
            return DATE;    // 日期类型
        } else {
            return TEXT;    // 其他类型默认映射为文本类型
        }
    }
}
