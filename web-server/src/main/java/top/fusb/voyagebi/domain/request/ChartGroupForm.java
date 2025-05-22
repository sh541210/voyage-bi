package top.fusb.voyagebi.domain.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;
import top.fusb.voyagebi.domain.ChartGroupCfg;
import top.fusb.voyagebi.domain.enums.GroupType;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * 图表组新增/编辑表单
 */
@Data
public class ChartGroupForm implements Serializable {
    /** ID */
    private Long id;
    /** 标题 */
    @NotEmpty
    @Size(max = 20)
    private String title;
    /** 副标题 */
    @Size(max = 60)
    private String subTitle;
    /** 仪表盘ID */
    private Long dashboardId;
    /** 组类型 */
    private GroupType groupType;
    /** 图表组配置项 */
    private ChartGroupCfg cfg;
    /** 样式配置项 */
    private Map<String, Object> styleCfg;
    /** 图表ID集合 */
    private List<Long> chartIds;
    /** 是否显示标题 */
    private Boolean showTitle;
    /** 自定义数据，已废弃 */
    @Deprecated
    private String customData;
}
