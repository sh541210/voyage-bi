package top.fusb.voyagebi.domain.VO;

import lombok.Data;

import java.io.Serializable;
import java.util.Map;

/**
 * 主题视图对象
 */
@Data
public class ThemeVO implements Serializable {
    /** 主题ID */
    private Long id;
    /** 主题名称 */
    private String name;
    /** 仪表盘样式配置项 */
    private Map<String, Object> dashboardStyleCfg;
    /** 渲染代码 */
    private String renderCode;
    /** 图形渲染类型 */
    private String graphRenderType;
}