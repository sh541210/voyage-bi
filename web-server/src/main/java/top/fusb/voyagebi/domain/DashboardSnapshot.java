package top.fusb.voyagebi.domain;

import lombok.Data;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * 仪表盘快照类，用于存储仪表盘的快照数据
 * 包括仪表盘的名称、布局配置、仪表盘配置、图表快照、图表分组快照等信息
 */
@Data  // 自动生成getter、setter等方法
public class DashboardSnapshot implements Serializable {

    /** 仪表盘的名称 */
    private String name;

    /** 布局配置，用于定义仪表盘的布局 */
    private Map<String, Object> layoutCfg;

    /** 仪表盘的配置项 */
    private DashboardCfg cfg;

    /** 包含仪表盘中的图表快照 */
    private List<ChartSnapshot> charts;

    /** 包含仪表盘中的图表分组快照 */
    private List<ChartGroupSnapshot> groups;

    /** 样式配置，用于定义仪表盘的外观样式 */
    private Map<String, Object> styleCfg;
}