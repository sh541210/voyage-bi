package top.fusb.voyagebi.open;

import top.fusb.voyagebi.domain.Pagination;
import lombok.Data;

import java.io.Serializable;
import java.util.Map;

/**
 * 请求
 */
@Data
public class ApiRequest implements Serializable {
    /** 项目名称（必选） **/
    private String projectName;
    /** api名称（必选） **/
    private String apiName;
    /** 参数（可选） **/
    private Map<String, Object> parameters;
    /** 分页参数（可选） **/
    private Pagination pagination;
}
