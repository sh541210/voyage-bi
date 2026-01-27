package top.fusb.voyagebi.domain.VO;

import lombok.Data;
import lombok.EqualsAndHashCode;
import top.fusb.voyagebi.base.domain.VO.BaseVO;
import top.fusb.voyagebi.domain.enums.ChartComponentType;

import java.io.Serializable;

/**
 * 图表组件简易视图对象
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class ChartComponentSimpleVO extends BaseVO implements Serializable {
    /** ID */
    private Long id;
    /** CODE */
    private String code;
    /** 名称 */
    private String name;
    /** 图标名 */
    private String icon;
    /** 描述 */
    private String description;
    /** 组件类型 */
    private ChartComponentType type;
    /** 是否启用 */
    private boolean enabled;
}
