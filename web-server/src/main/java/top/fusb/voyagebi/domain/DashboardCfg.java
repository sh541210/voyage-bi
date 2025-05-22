package top.fusb.voyagebi.domain;

import lombok.Data;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * 仪表盘配置类，包含仪表盘相关的配置项
 * 包括过滤器配置和图表交互配置
 */
@Data  // 自动生成getter、setter等方法
public class DashboardCfg implements Serializable {

    /** 过滤器配置列表，用于仪表盘中的筛选条件 */
    private List<FilterCfg> filters = List.of();

    /** 图表交互配置列表，用于定义图表之间的交互行为 */
    private List<Map<String, Object>> chartInteractionCfgs = List.of();
}
