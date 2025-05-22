package top.fusb.voyagebi.domain.enums;

import lombok.Getter;

/**
 * 表示数据表或视图的类型。
 * <p>
 * 该枚举类用于标识不同的工作表类型，如视图（VIEW）和数据表（TABLE）。
 * </p>
 */
@Getter
public enum SheetType {

    /** 视图类型，表示 SQL 数据集 */
    VIEW("SQL数据集"),

    /** 数据表类型，表示数据表 */
    TABLE("数据表");

    /** 工作表类型的中文名称 */
    private final String name;

    /**
     * 构造方法，用于初始化工作表类型的名称。
     *
     * @param name 工作表类型的中文名称
     */
    SheetType(String name) {
        this.name = name;
    }
}