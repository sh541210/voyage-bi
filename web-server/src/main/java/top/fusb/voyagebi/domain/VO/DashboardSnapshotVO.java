package top.fusb.voyagebi.domain.VO;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 仪表盘快照视图对象
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class DashboardSnapshotVO extends DashboardVO {
    /** 主题信息 */
    private ThemeVO theme;
    /** KEY */
    private String key;
}