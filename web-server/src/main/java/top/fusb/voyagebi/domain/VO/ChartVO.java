package top.fusb.voyagebi.domain.VO;

import lombok.Data;
import lombok.EqualsAndHashCode;
import top.fusb.voyagebi.domain.ChartCfg;

import java.io.Serializable;
import java.util.Map;
import java.util.Set;

/**
 * 图表视图对象
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class ChartVO extends BaseVO implements Serializable {
    /** ID */
    private Long id;
    /** 名称 */
    private String name;
    /** 组ID */
    private Long groupId;
    /** 组名称 */
    private String groupName;
    /** 组标题 */
    private String groupTitle;
    /** 组副标题 */
    private String groupSubTitle;
    /** 类型 */
    private String type;
    /** 移动端类型 */
    private String mobileType;
    /** 图表配置 */
    private ChartCfg cfg;
    /** 样式配置 */
    private Map<String, Object> styleCfg;
    /** 仪表盘ID */
    private Long dashboardId;
    /** 数据表ID */
    private Long dataSheetId;
    /** 提示文本 */
    private String tipText;
    /** 是否未找到列 */
    private boolean columnNotFound;
    /** 数据更新时间 */
    private Long dataUpdateTime;
    /** 变量名集合 */
    private Set<String> variableNames;
}
