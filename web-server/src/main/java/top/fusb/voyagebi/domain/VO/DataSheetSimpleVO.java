package top.fusb.voyagebi.domain.VO;

import lombok.Data;

import java.io.Serializable;

/**
 * 数据表简洁视图对象
 */
@Data
public class DataSheetSimpleVO implements Serializable {
    /** 数据表ID */
    private Long id;
    /** 数据表名称 */
    private String name;
    /** 数据表类型 */
    private String type;
}
