package top.fusb.voyagebi.domain;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.Data;
import top.fusb.voyagebi.base.domain.utils.DateToLongDeserializer;

import java.io.Serializable;
import java.util.Map;
import java.util.Set;

/**
 * 图表快照对象
 */
@Data
public class ChartSnapshot implements Serializable {
    /** 图表ID */
    private Long id;
    /** 图表名称 */
    private String name;
    /** 图表所在分组ID */
    private Long groupId;
    /** 图表分组名称 */
    private String groupName;
    /** 图表分组标题 */
    private String groupTitle;
    /** 图表分组副标题 */
    private String groupSubTitle;
    /** 图表类型 */
    private String type;
    /** 移动端图表类型 */
    private String mobileType;
    /** 图表配置 */
    private ChartCfg cfg;
    /** 样式配置 */
    private Map<String, Object> styleCfg;
    /** 仪表盘ID */
    private Long dashboardId;
    /** 数据源ID */
    private Long datasourceId;
    /** 数据表ID */
    private Long dataSheetId;
    /** 图表提示文本 */
    private String tipText;
    /** 数据更新时间 */
    @JsonDeserialize(using = DateToLongDeserializer.class)
    private Long dataUpdateTime;
    /** 图表使用的变量名称列表 */
    private Set<String> variableNames;
}
