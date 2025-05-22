package top.fusb.voyagebi.persist.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.example.server.mybatis.BaseEntity;
import top.fusb.voyagebi.domain.DashboardCfg;
import top.fusb.voyagebi.domain.enums.DashboardType;

import java.util.Map;

/**
 * 仪表盘实体类，表示一个仪表盘的基本信息及配置
 */
@EqualsAndHashCode(callSuper = true)
@Data
@TableName(value = "bi_dashboard", autoResultMap = true)
public class Dashboard extends BaseEntity<Dashboard> {

    /** 仪表盘的名称 */
    private String name;

    /** 仪表盘的描述信息 */
    private String description;

    /** 仪表盘类型，定义了仪表盘的功能或显示形式 */
    private DashboardType type;

    /** 仪表盘的配置信息，使用JSON格式存储仪表盘的相关配置 */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private DashboardCfg cfg;

    /** 仪表盘的样式配置，使用JSON格式存储仪表盘的样式相关配置 */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private Map<String, Object> styleCfg;

    /** 仪表盘的布局配置，使用JSON格式存储仪表盘的布局相关配置 */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private Map<String, Object> layoutCfg;

    /** 所属应用ID，表示该仪表盘属于哪个应用 */
    private Long appId;
}
