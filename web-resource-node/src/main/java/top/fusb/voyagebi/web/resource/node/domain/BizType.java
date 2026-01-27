package top.fusb.voyagebi.web.resource.node.domain;

import lombok.Getter;

public enum BizType {
    DASHBOARD("仪表盘", "dashboard"),
    DATA_SHEET("数据集", "dataSheet"),
    DATASOURCE("数据源", "datasource");

    @Getter
    private final String desc;
    @Getter
    private final String code;

    BizType(String desc, String code) {
        this.desc = desc;
        this.code = code;
    }

    public static BizType fromCode(String code) {
        for (BizType value : values()) {
            if (value.getCode().equals(code)) {
                return value;
            }
        }
        throw new RuntimeException("类型错误");
    }
}
