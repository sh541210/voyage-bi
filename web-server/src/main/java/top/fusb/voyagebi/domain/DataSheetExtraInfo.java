package top.fusb.voyagebi.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import top.fusb.voyagebi.domain.VO.DataSheetColumnSimpleVO;

import java.io.Serializable;
import java.util.Map;
import java.util.Set;

/**
 * 数据表额外信息类，包含数据更新时间、变量名列表和列信息
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DataSheetExtraInfo implements Serializable {

    /**
     * 数据表的更新时间
     * 该字段用于记录数据表的最后更新时间
     */
    private Long dataUpdateTime;

    /**
     * 变量名称列表
     * 该字段用于存储与数据表相关的变量名
     */
    private Set<String> variableNames;

    /**
     * 数据表列信息
     * 该字段用于存储与数据表列相关的详细信息，映射为列的ID与列的简要信息
     */
    private Map<Long, DataSheetColumnSimpleVO> columns;
}