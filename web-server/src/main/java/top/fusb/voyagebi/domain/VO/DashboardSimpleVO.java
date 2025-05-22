package top.fusb.voyagebi.domain.VO;

import top.fusb.voyagebi.domain.enums.DashboardType;
import lombok.Data;

import java.io.Serializable;

/**
 * 简化版仪表盘视图对象
 */
@Data
public class DashboardSimpleVO implements Serializable {
    /** ID */
    private Long id;
    /** 名称 */
    private String name;
    /** 描述 */
    private String description;
    /** 仪表盘ID */
    private Long dashboardId;
    /** 仪表盘类型 */
    private DashboardType type;
    /** 仪表盘类型名称 */
    private String typeName;
    /** 应用ID */
    private Long appId;
}