package top.fusb.voyagebi.domain.VO;

import lombok.Data;

import java.io.Serializable;

/**
 * 图表名称ID
 */
@Data
public class ChartLabel implements Serializable {
    /** ID */
    private Long id;
    /** 名称 */
    private String name;
}
