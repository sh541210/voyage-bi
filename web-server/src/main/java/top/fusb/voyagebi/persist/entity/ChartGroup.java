package top.fusb.voyagebi.persist.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.example.server.mybatis.LogicalIdEntity;
import top.fusb.voyagebi.domain.ChartGroupCfg;
import top.fusb.voyagebi.domain.enums.GroupType;

import java.util.List;
import java.util.Map;

/**
 * 图表分组实体类，表示一个图表分组的信息。
 * 包含分组的标题、副标题、所属仪表盘、图表类型等字段。
 */
@EqualsAndHashCode(callSuper = true)
@Data
@TableName(value = "bi_chart_group", autoResultMap = true)
public class ChartGroup extends LogicalIdEntity<ChartGroup> {

    /** 分组标题 */
    private String title;

    /** 分组副标题 */
    private String subTitle;

    /** 所属仪表盘的ID */
    private Long dashboardId;

    /** 图表分组的类型 */
    private GroupType groupType;

    /** 分组的配置 */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private ChartGroupCfg cfg;

    /** 分组的样式配置 */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private Map<String, Object> styleCfg;

    /** 是否显示标题 */
    private Boolean showTitle;

    /** 自定义数据 */
    private String customData;

    /** 图表ID列表，表示该分组包含的图表 */
    @TableField(typeHandler = org.example.server.mybatis.handler.LongListTypeHandler.class)
    private List<Long> chartIds;
}