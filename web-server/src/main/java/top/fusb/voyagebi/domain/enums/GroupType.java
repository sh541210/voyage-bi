package top.fusb.voyagebi.domain.enums;

import lombok.Getter;

@Getter
public enum GroupType {
    GRID("网格类型分组"),
    TAB("标签页类型分组");

    private final String description;

    GroupType(String description) {
        this.description = description;
    }

    @Override
    public String toString() {
        return description;
    }
}
