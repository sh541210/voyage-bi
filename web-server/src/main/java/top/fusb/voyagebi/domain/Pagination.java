package top.fusb.voyagebi.domain;

import lombok.Data;

import java.io.Serializable;

/**
 * 分页参数
 */
@Data
public class Pagination implements Serializable {

    /** 每页显示的记录数，默认值为 10 */
    private Long pageSize = 10L;

    /** 当前页码，默认值为 1 */
    private Long pageNum = 1L;

    /**
     * 返回分页的 SQL 语句（LIMIT 子句）。
     * <p>
     * 根据当前页码（pageNum）和每页大小（pageSize）生成 MySQL 中的分页查询语句。
     * 如果 pageNum 或 pageSize 小于等于 0，则分别默认设置为 1 和 10。
     * </p>
     *
     * @return 返回符合 MySQL 分页语法的 LIMIT 子句
     */
    @Override
    public String toString() {
        // 检查 pageNum 是否为负数或零，如果是，则将其设置为 1
        if (pageNum <= 0) {
            pageNum = 1L;  // 如果页码小于等于零，默认设置为第一页
        }

        // 检查 pageSize 是否为负数或零，如果是，则将其设置为 10
        if (pageSize <= 0) {
            pageSize = 10L;  // 如果每页数据量小于等于零，默认设置为每页 10 条数据
        }

        // 返回分页 SQL 语句，采用 MySQL 中的 LIMIT 子句格式
        return String.format("LIMIT %s, %s", (pageNum - 1) * pageSize, pageSize);
        // 示例：pageNum = 2, pageSize = 10 时，返回 LIMIT 10, 10
    }
}
