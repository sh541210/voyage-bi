package top.fusb.voyagebi.persist.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.example.server.mybatis.BaseEntity;
import top.fusb.voyagebi.domain.ChartCfg;

import java.util.Map;

/**
 * 图表实体类，表示一个图表的基本信息及其配置。
 * 包含图表的名称、数据表ID、类型、样式配置、配置项、所属的仪表盘ID等信息。
 */
@EqualsAndHashCode(callSuper = true)
@Data
@TableName(value = "bi_chart", autoResultMap = true)
public class Chart extends BaseEntity<Chart> {

    /** 图表名称 */
    private String name;

    /** 关联的数据表ID */
    private Long dataSheetId;

    /** 图表的类型，可能是柱状图、折线图等 */
    @TableField(value = "`type`")
    private String type;

    /** 移动端展示类型 */
    private String mobileType;

    /** 图表的样式配置，存储为Map */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private Map<String, Object> styleCfg;

    /** 所属仪表盘的ID */
    private Long dashboardId;

    /** 图表的具体配置项，使用ChartCfg类来封装 */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private ChartCfg cfg;

    /** 图表分组的ID */
    private Long groupId;

    /** 图表的提示文本 */
    private String tipText;
}
