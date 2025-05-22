package top.fusb.voyagebi.domain.VO;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

/**
 * 数据表详情视图对象
 * 继承自DataSheetVO
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class DataSheetDetailVO extends DataSheetVO {
    /** 数据表列集合 */
    private List<DataSheetColumnVO> columns;
}
