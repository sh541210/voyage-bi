package top.fusb.voyagebi.domain;

import lombok.Data;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

/**
 * 数据表配置类，包含数据表的默认参数值
 */
@Data
public class DataSheetCfg implements Serializable {

    /**
     * 参数默认值映射
     * 该字段用于存储数据表参数的默认值，使用键值对的形式
     */
    private Map<String, Object> parameterDefaultValues = new HashMap<>();
    private CacheCfg cacheCfg = new CacheCfg();
}