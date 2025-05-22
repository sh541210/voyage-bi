package top.fusb.voyagebi.domain.enums;

/**
 * 表示数据列的类型，包括维度和指标。
 * <p>
 * 该枚举用于标识不同类型的数据列：维度（DIMENSION）和指标（METRIC）。
 * </p>
 */
public enum SheetColumnType {

    /** 维度类型 */
    DIMENSION,

    /** 指标类型 */
    METRIC;

    /**
     * 根据列的类型和名称返回相应的列类型（维度或指标）。
     * <p>
     * 此方法根据传入的列类型和列名称来判断数据列的类型。
     * - 如果列类型或列名称符合维度的标准，则返回 `DIMENSION`；
     * - 如果列类型符合指标类型且列名称不符合维度标准，则返回 `METRIC`；
     * - 默认情况下，返回 `DIMENSION`。
     * </p>
     *
     * @param columnType 列的数据库类型（如 "VARCHAR"、"INT" 等）
     * @param columnName 列的名称（如 "user_id"、"sales_amount" 等）
     * @return 对应的枚举值：`DIMENSION` 或 `METRIC`
     */
    public static SheetColumnType ofColumn(String columnType, String columnName) {
        if (isDimensionColumnType(columnType) || isDimensionColumnName(columnName)) {
            return DIMENSION; // 如果是维度列类型或维度列名称，返回维度
        } else if (isMetricColumnType(columnType) && !isDimensionColumnName(columnName)) {
            return METRIC; // 如果是指标列类型且不是维度列名称，返回指标
        } else {
            return DIMENSION; // 默认为维度
        }
    }

    /**
     * 判断列类型是否属于维度类型。
     * <p>
     * 该方法根据列的数据库类型判断其是否为维度类型，维度通常是文本类型的列。
     * </p>
     *
     * @param columnType 列的数据库类型（如 "VARCHAR"、"STRING" 等）
     * @return 如果列类型属于维度类型，返回 `true`，否则返回 `false`
     */
    private static boolean isDimensionColumnType(String columnType) {
        return columnType.equalsIgnoreCase("VARCHAR") || columnType.equalsIgnoreCase("STRING");
    }

    /**
     * 判断列类型是否属于指标类型。
     * <p>
     * 该方法根据列的数据库类型判断其是否为指标类型，指标通常是数字类型的列。
     * </p>
     *
     * @param columnType 列的数据库类型（如 "INT"、"BIGINT" 等）
     * @return 如果列类型属于指标类型，返回 `true`，否则返回 `false`
     */
    private static boolean isMetricColumnType(String columnType) {
        return columnType.equalsIgnoreCase("INT") || columnType.equalsIgnoreCase("BIGINT") ||
                columnType.equalsIgnoreCase("FLOAT") || columnType.equalsIgnoreCase("DOUBLE") ||
                columnType.equalsIgnoreCase("BigDecimal") || columnType.equalsIgnoreCase("LONG");
    }

    /**
     * 判断列名称是否属于维度类型。
     * <p>
     * 该方法根据列的名称来判断其是否为维度类型。维度名称通常包含某些特定的后缀，例如 "id"、"name" 等。
     * </p>
     *
     * @param columnName 列的名称（如 "user_id"、"sales_amount" 等）
     * @return 如果列名称符合维度的标准，返回 `true`，否则返回 `false`
     */
    private static boolean isDimensionColumnName(String columnName) {
        return columnName.toLowerCase().endsWith("id")
                || columnName.toLowerCase().endsWith("no")
                || columnName.toLowerCase().endsWith("type")
                || columnName.toLowerCase().endsWith("name")
                || columnName.toLowerCase().endsWith("desc")
                || columnName.toLowerCase().endsWith("code");
    }
}

