package top.fusb.voyagebi.domain;

import lombok.Data;

import java.io.Serializable;

/**
 * 排序基类，用于定义排序的基本字段和排序顺序。
 * <p>
 * 该类为排序提供了字段 `key` 和 `name`，以及排序顺序 `orderBy`（升序或降序）。
 * </p>
 */
@Data
public class SortBy implements Serializable {

    /** 排序字段的键，通常为排序的数据库字段 */
    protected Long key;

    /** 排序字段的名称（已废弃，使用 `key` 代替） */
    @Deprecated
    protected String name;

    /** 排序顺序，支持升序（ASC）或降序（DESC） */
    protected OrderBy orderBy;

    /**
     * 排序顺序枚举，定义了两种排序方式：升序（ASC）和降序（DESC）。
     */
    public enum OrderBy implements Serializable {
        /** 升序 */
        ASC,

        /** 降序 */
        DESC
    }
}