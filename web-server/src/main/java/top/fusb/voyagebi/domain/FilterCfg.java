package top.fusb.voyagebi.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import top.fusb.voyagebi.domain.enums.FilterType;

import java.io.Serializable;
import java.util.*;

/**
 * FilterCfg 配置类，用于配置过滤器相关的设置
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class FilterCfg implements Serializable {
    /**
     * 过滤器的唯一标识符
     */
    private String key;

    /**
     * 组件类型
     */
    private String componentType;

    /**
     * 过滤器类型
     */
    private FilterType filterType;

    /**
     * 字段属性，存储与字段相关的配置
     */
    private Map<String, Object> fieldProps;

    /**
     * 选项属性，存储与选项相关的配置
     */
    private Map<String, Object> optionsProps;

    /**
     * 其他属性，用于存储任意其他配置
     */
    private Map<String, Object> props;

    /**
     * 参数映射，存储参数与列的映射关系
     */
    private Map<Long, Map<String, Integer>> parameterMappings;

    /**
     * 过滤器的名称（已弃用）
     */
    @Deprecated
    private String name;

    /**
     * 获取索引（已弃用），将 `key` 映射为 `index`
     */
    @Deprecated
    @JsonProperty("index")
    public String getIndex() {
        return key;
    }

    /**
     * 获取类型（已弃用），将 `componentType` 映射为 `type`
     */
    @Deprecated
    @JsonProperty("type")
    public String getType() {
        return componentType;
    }

    /**
     * 获取图表映射关系（已弃用）
     */
    @Deprecated
    @JsonProperty("chartMappings")
    public Map<Long, Filter> getChartMappings() {
        Map<Long, FilterCfg.Filter> mappings = new HashMap<>();
        if (parameterMappings != null) {
            parameterMappings.forEach((key, map) -> {
                FilterCfg.Filter f = new FilterCfg.Filter();
                f.setColumns(map);
                f.setType("parameter");
                mappings.put(key, f);
            });
        }
        return mappings;
    }

    /**
     * 获取选择项（已弃用）
     */
    @Deprecated
    @JsonProperty("selectOption")
    public FilterSelectOption getSelectOption() {
        FilterSelectOption option = new FilterSelectOption();
        if (optionsProps != null) {
            Object o1 = optionsProps.get("labelColumn");
            Object o = optionsProps.get("valueColumn");
            if (o1 != null) {
                option.setLabelName(o1.toString());
            }
            if (o != null) {
                option.setValueName(o.toString());
            }
        }
        return option;
    }

    /**
     * 获取数据表 ID（已弃用）
     */
    @Deprecated
    @JsonProperty("dataSheetId")
    public Long getDataSheetId() {
        if (optionsProps != null) {
            return Optional.ofNullable(optionsProps.get("dataSheetId"))
                    .map(i -> Long.parseLong(i.toString())).orElse(null);
        }
        return null;
    }

    /**
     * 获取排序列（已弃用）
     */
    @Deprecated
    @JsonProperty("sortColumns")
    public List<String> getSortColumns() {
        if (optionsProps != null) {
            return Optional.ofNullable(optionsProps.get("sortColumns"))
                    .map(i -> (List) i).orElse(new ArrayList<>());
        }
        return new ArrayList<>();
    }

    /**
     * 组名（已弃用）
     */
    @Deprecated
    private String groupName;

    /**
     * 获取数据表 ID，返回 `optionsProps` 中的 `dataSheetId`
     */
    @JsonIgnore
    public Long dataSheetId() {
        return Optional.ofNullable(optionsProps.get("dataSheetId"))
                .map(i -> Long.parseLong(i.toString())).orElse(null);
    }

    /**
     * 内部 Filter 类，表示过滤器的类型和列映射
     */
    @Data
    public static class Filter implements Serializable {
        /**
         * 过滤器的类型
         */
        private String type;

        /**
         * 列的映射关系
         */
        private Map<String, Integer> columns;
    }

    /**
     * 内部 FilterSelectOption 类，表示选择项的标签和值
     */
    @Data
    public static class FilterSelectOption {
        /**
         * 标签名称
         */
        private String labelName;

        /**
         * 值名称
         */
        private String valueName;
    }
}