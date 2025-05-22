package top.fusb.voyagebi.domain;

import lombok.Data;
import top.fusb.voyagebi.domain.enums.GroupType;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * 图表分组快照对象
 */
@Data
public class ChartGroupSnapshot implements Serializable {
    /** 图表分组ID */
    private Long id;
    /** 图表分组标题 */
    private String title;
    /** 图表分组副标题 */
    private String subTitle;
    /** 仪表盘ID */
    private Long dashboardId;
    /** 分组类型 */
    private GroupType groupType;
    /** 图表分组配置 */
    private ChartGroupCfg cfg;
    /** 样式配置 */
    private Map<String, Object> styleCfg;
    /** 是否显示标题 */
    private Boolean showTitle;
    /** 自定义数据 */
    private String customData;
    /** 图表ID列表 */
    private List<Long> chartIds;
}
