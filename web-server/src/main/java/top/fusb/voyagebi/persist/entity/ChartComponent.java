package top.fusb.voyagebi.persist.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.example.server.mybatis.BaseEntity;
import top.fusb.voyagebi.domain.enums.ChartComponentType;

import java.util.Map;

/**
 * 图表组件实体类，表示一个图表组件的信息。
 * 包含组件的代码、名称、描述、属性、启用状态以及排序信息。
 */
@EqualsAndHashCode(callSuper = true)
@Data
@TableName(value = "bi_chart_component", autoResultMap = true)
public class ChartComponent extends BaseEntity<ChartComponent> {

    /** 组件的唯一标识码 */
    private String code;

    /** 组件的名称 */
    private String name;

    /** 组件的描述 */
    private String description;
    /** 图标名 */
    private String icon;

    /** 组件的属性，使用Map存储 */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private Map<String, Object> props;

    /** 组件是否启用 */
    private boolean enabled;

    /** 组件类型 */
    private ChartComponentType type;

    /** 组件的排序值 */
    private Integer sort;
}
