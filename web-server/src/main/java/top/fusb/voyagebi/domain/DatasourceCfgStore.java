package top.fusb.voyagebi.domain;

import lombok.Data;

import java.io.Serializable;
import java.util.Map;
import java.util.Optional;

/**
 * 数据源配置存储类，包含一个数据源配置的映射
 */
@Data
public class DatasourceCfgStore implements Serializable {

    /**
     * 数据源配置的映射
     * 存储数据源配置，以数据源名称为键，`DatasourceCfg` 对象为值
     */
    private Map<String, DatasourceCfg> data = Map.of();

    /**
     * 默认环境
     */
    private String defaultEnv = "default";


    public void updateCfg(String env, DatasourceCfg cfg) {
        data.put(env, cfg);
    }

    /**
     * 根据环境获取对应的配置，默认环境为 "default"
     */
    public DatasourceCfg getCfg(String env) {
        // 获取数据源配置，根据环境获取，如果没有传入环境，则使用默认环境 "default"
        return data.get(Optional.ofNullable(env).orElse(defaultEnv));
    }
}
