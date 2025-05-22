package top.fusb.voyagebi.persist.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.example.server.mybatis.LogicalIdEntity;

import java.util.Map;

/**
 * 主题实体类，表示系统中的一个主题。
 * 包含主题的名称、样式配置、渲染代码等信息。
 */
@EqualsAndHashCode(callSuper = true)
@Data
@TableName(value = "bi_theme", autoResultMap = true)
public class Theme extends LogicalIdEntity<Theme> {

    /** 主题名称 */
    private String name;

    /** 主题的仪表盘样式配置 */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private Map<String, Object> dashboardStyleCfg;

    /** 渲染代码 */
    private String renderCode;

    /** 图形渲染类型 */
    private String graphRenderType;
}