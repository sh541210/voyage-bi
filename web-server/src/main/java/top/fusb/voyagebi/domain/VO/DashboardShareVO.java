package top.fusb.voyagebi.domain.VO;

import lombok.Data;
import lombok.EqualsAndHashCode;
import top.fusb.voyagebi.base.domain.VO.BaseVO;
import top.fusb.voyagebi.domain.enums.DashboardType;

import java.io.Serializable;

/**
 * 仪表盘分享视图对象
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class DashboardShareVO extends BaseVO implements Serializable {
    /** ID */
    private Long id;
    /** 名称 */
    private String name;
    /** 描述 **/
    private String description;
    /** KEY */
    private String key;
    /** 仪表盘ID */
    private Long dashboardId;
    /** 是否启用 */
    private Boolean enabled;
    /** 应用ID */
    private Long appId;
    /** 仪表盘类型 */
    private DashboardType type;
    /** 主题 */
    private Long themeId;
}