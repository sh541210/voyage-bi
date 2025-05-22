package top.fusb.voyagebi.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

/**
 * 数据表快照类，包含 SQL 文本映射和数据表配置映射
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DataSheetSnapshot implements Serializable {

    /**
     * SQL 文本映射
     * 该字段用于存储与数据表相关的 SQL 文本，键为数据表 ID，值为对应的 SQL 文本
     */
    private Map<Long, String> sqlTextMap;

    /**
     * 数据表配置映射
     * 该字段用于存储每个数据表的配置信息，键为数据表 ID，值为对应的 `DataSheetCfg` 配置对象
     */
    private Map<Long, DataSheetCfg> dataSheetCfgMap = new HashMap<>();
}