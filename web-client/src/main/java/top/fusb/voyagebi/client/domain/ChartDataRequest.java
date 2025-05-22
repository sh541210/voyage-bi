package top.fusb.voyagebi.client.domain;

import lombok.Data;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

@Data
public class ChartDataRequest implements Serializable {
    private Long chartId;
    private Map<String, Object> parameters;
    private String shareKey;
    private String env;
    private boolean preview;
    private List<Map<String,Object>> sorts;
    private boolean total;
    private Map<String,Object> pagination;
    private String dataMode;
    private Map<String,Object> drillDownParam;
}