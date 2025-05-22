package top.fusb.voyagebi.domain.request;

import lombok.Data;

import java.io.Serializable;
import java.util.Map;
import java.util.Set;

/**
 * 数据集数据获取请求参数
 */
@Data
public class SheetDataGetParam implements Serializable {
    /** ID */
    private Long id;
    /** 参数 */
    private Map<String, Object> parameters;
    /** 环境 */
    private String env;
    /** 是否预览 */
    private boolean preview;
    /** 列 **/
    private Set<String> columns;
}
