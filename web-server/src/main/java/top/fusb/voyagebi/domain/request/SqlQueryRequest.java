package top.fusb.voyagebi.domain.request;

import lombok.Data;
import top.fusb.bi.data.base.utils.SqlUtils;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

/**
 * SQL查询请求类，用于封装数据库查询的请求信息。
 * <p>
 * 该类包含了查询所需的 SQL 语句、参数、数据源信息以及环境信息。
 * </p>
 */
@Data
public class SqlQueryRequest implements Serializable {

    /**
     * 数据源ID，用于标识查询使用的数据源
     */
    private Long datasourceId;

    /**
     * SQL查询语句，包含完整的 SQL 查询
     */
    private String sqlText;

    /**
     * 查询参数，存储 SQL 查询中所需的参数（键值对）
     */
    private Map<String, Object> parameters = new HashMap<>();

    /**
     * 查询的环境信息，如开发环境（dev）、生产环境（prod）等
     */
    private String env;

    public String getSqlText() {
        return SqlUtils.removeSemicolon(sqlText);
    }
}
