package top.fusb.voyagebi.domain.request;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * 钻取参数
 */
@Data
public class DrillDownParam implements Serializable {
    /** 钻取筛选条件 */
    private List<FilterValue> filters;
    /** 钻取GROUP BY列ID */
    private Long columnId;

    @Data
    public static class FilterValue {
        /** 钻取筛选列ID */
        private Long columnId;
        /** 钻取值 */
        private List<Object> values;
    }
}
