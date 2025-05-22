package top.fusb.voyagebi.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * 图表分组配置对象
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ChartGroupCfg implements Serializable {
    /** 过滤器配置列表 */
    private List<FilterCfg> filters = new ArrayList<>();
    /** 图表标签配置列表 */
    private List<ChartTabs> chartTabs = new ArrayList<>();

    /**
     * 图表标签配置
     */
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ChartTabs {
        /** 标签名称 */
        private String name;
        /** 是否显示标题 */
        private boolean showTitle;
        /** 是否显示标签 */
        private boolean showTab;
        /** 图表ID列表 */
        private List<Long> chartIds;
        /** 绑定ID */
        private Long bindId;
    }
}