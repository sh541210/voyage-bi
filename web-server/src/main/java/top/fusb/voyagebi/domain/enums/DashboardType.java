package top.fusb.voyagebi.domain.enums;

import lombok.Getter;

/**
 * 仪表盘类型枚举类，定义了不同类型的仪表盘
 */
@Getter  // 自动生成getter方法
public enum DashboardType {

    /** 仪表板类型 */
    DASHBOARD("仪表板"),

    /** 报表类型 */
    REPORT("报表"),

    /** 看板类型 */
    KANBAN("看板");

    /** 枚举值对应的名称 */
    private final String name;

    /**
     * 构造函数，用于初始化枚举类型的名称
     * @param name 枚举对应的名称
     */
    DashboardType(String name) {
        this.name = name;
    }
}
