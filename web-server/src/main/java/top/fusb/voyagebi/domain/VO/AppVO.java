package top.fusb.voyagebi.domain.VO;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * 应用视图对象
 */
@Data
public class AppVO implements Serializable {
    /** 名称 */
    private String name;
    /** 描述 */
    private String description;
    /** ID */
    private Long id;
    /** 仪表盘列表 */
    private List<DashboardSimpleVO> dashboards;
    /** 分享列表 */
    private List<DashboardShareVO> shares;
}