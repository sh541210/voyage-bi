package top.fusb.voyagebi.domain.request;

import top.fusb.voyagebi.domain.enums.ChartComponentType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serializable;
import java.util.Map;

/**
 * 组件新增/编辑表单
 */
@Data
public class ChartComponentForm implements Serializable {
    /** ID */
    private Long id;
    /** CODE */
    @NotEmpty
    @Size(max = 30)
    private String code;
    /** 名称 */
    @NotEmpty
    @Size(max = 16)
    private String name;
    /** 图标名 */
    @NotEmpty
    @Size(max = 32)
    private String icon;
    /** 描述 */
    @Size(max = 120)
    private String description;
    /** 配置项 */
    private Map<String,Object> props;
    /** 组件类型 */
    private ChartComponentType type;
    /** 是否启用 */
    private boolean enabled;
}