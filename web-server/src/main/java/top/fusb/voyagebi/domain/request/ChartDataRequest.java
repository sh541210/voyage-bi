package top.fusb.voyagebi.domain.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import top.fusb.voyagebi.domain.ChartCfg;
import top.fusb.voyagebi.domain.Pagination;
import top.fusb.voyagebi.domain.SortBy;
import top.fusb.voyagebi.websocket.base.WebSocketRequest;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * 图表数据请求
 */
@Data
public class ChartDataRequest implements Serializable, WebSocketRequest {
    /**
     * 图表ID
     */
    private Long chartId;
    /**
     * 图表参数
     */
    private Map<String, Object> parameters;
    /**
     * 分享KEY
     */
    private String shareKey;
    /**
     * 环境
     */
    private String env;
    /**
     * 是否预览
     */
    private boolean preview;
    /**
     * 动态排序参数
     */
    private List<SortBy> sorts;
    /**
     * 是否查询所有数据
     */
    private boolean total;
    /**
     * 分页参数
     */
    private Pagination pagination;
    /**
     * 图表配置项
     */
    private ChartCfg chartCfg;
    /**
     * 数据请求模式
     */
    private DataMode dataMode = DataMode.CACHE;
    /**
     * 钻取参数
     */
    private DrillDownParam drillDownParam;
    private boolean calcCount;
    private String source;
    private boolean clearMetadata = true;

    @Override
    public String getRequestId() {
        return chartId.toString();
    }

    @Getter
    @AllArgsConstructor
    public enum DataMode {
        REAL_TIME(true),
        CACHE(false);
        // 强制刷新
        public final boolean forceRefresh;
    }
}
