package top.fusb.voyagebi.domain.VO;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.util.Map;

/**
 * 图表组件视图对象
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class ChartComponentVO extends ChartComponentSimpleVO implements Serializable {
    /** 配置项 */
    private Map<String,Object> props;
}
