package top.fusb.voyagebi.domain.VO;

import top.fusb.voyagebi.domain.ChartGroupCfg;
import top.fusb.voyagebi.domain.enums.GroupType;
import lombok.Data;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * 图表组视图对象
 */

@Data
public class ChartGroupVO implements Serializable {
    /** ID */
    private Long id;
    /** 图表组的标题 */
    private String title;
    /** 图表组的副标题 */
    private String subTitle;
    /** 所属仪表盘的ID */
    private Long dashboardId;
    /** 图表组的类型 */
    private GroupType groupType;
    /** 图表组的配置信息 */
    private ChartGroupCfg cfg;
    /** 图表组的样式配置 */
    private Map<String, Object> styleCfg;
    /** 包含的图表ID列表 */
    private List<Long> chartIds;
    /** 是否显示图表组标题 */
    private Boolean showTitle;
    /** 自定义数据字段 */
    private String customData;
}
