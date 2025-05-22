package top.fusb.voyagebi.domain.VO;

import lombok.Data;

import java.io.Serializable;

/**
 * 首页中心数据视图对象
 */
@Data
public class HomeCenterDataVO implements Serializable {
    private Long dataSheetCount;
    private Long datasourceCount;
    private Long dashboardCount;
}
