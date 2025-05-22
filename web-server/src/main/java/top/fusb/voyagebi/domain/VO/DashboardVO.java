package top.fusb.voyagebi.domain.VO;

import top.fusb.voyagebi.domain.DashboardCfg;
import top.fusb.voyagebi.domain.enums.DashboardType;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * 仪表盘视图对象
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class DashboardVO extends BaseVO implements Serializable {
    /** ID */
    private Long id;
    /** 名称 */
    private String name;
    /** 描述 */
    private String description;
    /** 仪表盘配置 */
    private DashboardCfg cfg;
    /** 样式配置 */
    private Map<String, Object> styleCfg;
    /** 布局配置 */
    private Map<String, Object> layoutCfg;
    /** 图表列表 */
    private List<ChartVO> charts;
    /** 图表组列表 */
    private List<ChartGroupVO> groups;
    /** 是否启用 */
    private Boolean enabled;
    /** 应用ID */
    private Long appId;
    /** 仪表盘类型 */
    private DashboardType type;
}
