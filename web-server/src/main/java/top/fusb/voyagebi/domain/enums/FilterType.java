package top.fusb.voyagebi.domain.enums;

import lombok.Getter;

@Getter
public enum FilterType {
    parameter("参数类型过滤器"),
    dataSheet("数据表类型过滤器");

    private final String description;

    FilterType(String description) {
        this.description = description;
    }

    @Override
    public String toString() {
        return description;
    }
}
