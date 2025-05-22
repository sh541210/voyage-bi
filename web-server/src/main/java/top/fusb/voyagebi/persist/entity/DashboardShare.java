package top.fusb.voyagebi.persist.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.example.server.mybatis.BaseEntity;
import top.fusb.voyagebi.domain.DashboardSnapshot;
import top.fusb.voyagebi.domain.DataSheetSnapshot;
import top.fusb.voyagebi.domain.DataSheetSnapshotV2;
import top.fusb.voyagebi.domain.enums.DashboardType;

import java.util.Map;

/**
 * 代表仪表盘分享实体，包含分享的仪表盘快照、主题、数据源等信息。
 * 该类用于管理和存储仪表盘分享的相关数据，并且与仪表盘的分享配置和状态相关。
 */
@EqualsAndHashCode(callSuper = true)
@Data
@TableName(value = "bi_dashboard_share", autoResultMap = true)
public class DashboardShare extends BaseEntity<DashboardShare> {

    /** 分享仪表盘的名称 */
    private String name;

    /** 分享的仪表盘快照 */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private DashboardSnapshot dashboardSnapshot;

    /** 分享所使用的主题ID */
    private Long themeId;

    /** 分享仪表盘的描述 **/
    private String description;

    /** 唯一标识符，用于识别该分享 */
    @TableField(value = "`key`")
    private String key;

    /** 关联的仪表盘ID */
    private Long dashboardId;

    /** 共享的数据集快照 */
    @Deprecated
    @TableField(typeHandler = JacksonTypeHandler.class)
    private DataSheetSnapshot dataSheetSnapshot;

    @TableField(typeHandler = JacksonTypeHandler.class)
    private Map<Long, DataSheetSnapshotV2> dataSheetSnapshots;

    /** 是否启用分享 */
    private Boolean enabled;

    /** 所属应用ID，表示该分享属于哪个应用 */
    private Long appId;

    /** 分享仪表盘的类型 */
    private DashboardType type;
}