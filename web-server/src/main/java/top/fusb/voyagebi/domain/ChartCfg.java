package top.fusb.voyagebi.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import top.fusb.voyagebi.domain.VO.DataSheetColumnSimpleVO;

import java.io.Serializable;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 图表配置对象
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ChartCfg implements Serializable {
    /** 过滤器配置列表 */
    private List<FilterCfg> filters = new ArrayList<>();
    /** 条件配置列表 */
    private List<Condition> conditions = new ArrayList<>();
    /** 参数条件映射 */
    private Map<String, Object> parameterConditions = new HashMap<>();
    /** 数值列 */
    private List<Column> values = new ArrayList<>();
    /** 分组列 */
    private List<Column> groupBy = new ArrayList<>();
    /** 限制条目数 */
    private Integer limit;
    /** 排序列ID（已废弃） */
    @Deprecated
    private Long sortColumnId;
    /** 排序键 */
    private Long sortKey;
    /** 配置属性 */
    private Map<String, Object> props = new HashMap<>();

    /**
     * 获取排序键，优先使用 sortKey，其次使用废弃的 sortColumnId
     */
    public Long getSortKey() {
        return Optional.ofNullable(sortKey).orElse(sortColumnId);
    }

    /**
     * 更新列的描述
     * @param sheetColumns 数据表列映射
     */
    public void updateColumns(Map<Long, DataSheetColumnSimpleVO> sheetColumns) {
        for (Column value : values) {
            DataSheetColumnSimpleVO sheetColumn = sheetColumns.get(value.getId());
            if (sheetColumn != null) {
                value.setDesc(sheetColumn.getDesc());
            }
        }
        for (Column column : groupBy) {
            DataSheetColumnSimpleVO sheetColumn = sheetColumns.get(column.getId());
            if (sheetColumn != null) {
                column.setDesc(sheetColumn.getDesc());
            }
        }
    }

    /**
     * 获取分组列的 SQL
     */
    @JsonIgnore
    public List<String> getGroupByColumns() {
        return groupBy.stream().map(Column::getColumnSql).toList();
    }

    /**
     * 获取数值列和分组列的 SQL
     */
    @JsonIgnore
    public List<String> getValueColumns() {
        return values.stream().map(Column::getCalcColumnSql).toList();
    }

    /**
     * 获取条件的 SQL
     */
    @JsonIgnore
    public List<String> getConditionsSql() {
        if (conditions == null) {
            return List.of();
        }
        return conditions.stream().map(Condition::toString).toList();
    }

    /**
     * 获取所有列（包括数值列、分组列和条件列）
     */
    @JsonIgnore
    public List<Column> getAllColumns() {
        List<Column> columns = getXY();
        columns.addAll(conditions);
        return columns;
    }

    /**
     * 获取数值列和分组列
     */
    @JsonIgnore
    public List<Column> getXY() {
        List<Column> list = new ArrayList<>();
        list.addAll(values);
        list.addAll(groupBy);
        return list;
    }

    /**
     * 获取所有排序规则
     * @param sorts 动态排序规则
     */
    @JsonIgnore
    public List<Sort> getAllSorts(List<SortBy> sorts) {
        List<Column> columns = getAllColumns().stream().peek(i -> {
            Sort sort = Optional.ofNullable(i.getSort()).orElse(new Sort());
            sort.setKey(i.getKey());
            sort.setName(i.getColumnSql());
            i.setSort(sort);
        }).toList();
        List<Sort> sortList = columns.stream().filter(i -> i.getKey().equals(getSortKey()))
                .map(Column::getSort).filter(Objects::nonNull).toList();
        Map<Object, Column> map = columns.stream().collect(Collectors.toMap(Column::getKey, i -> i, (a, b) -> b));
        List<Sort> dynamicList = sorts.stream().map(i -> {
            Column column = map.get(i.getKey());
            if (column != null) {
                Sort sort = column.getSort();
                sort.setOrderBy(i.getOrderBy());
                return sort;
            }
            return null;
        }).filter(Objects::nonNull).toList();
        List<Sort> list = new ArrayList<>();
        list.addAll(dynamicList);
        list.addAll(sortList);
        return list;
    }

    /**
     * 获取分组列的最终名称
     */
    @JsonIgnore
    public List<String> getX() {
        return getGroupBy().stream().map(Column::getFinalName).toList();
    }

    /**
     * 获取数值列的最终名称
     */
    @JsonIgnore
    public List<String> getY() {
        return getValues().stream().map(Column::getFinalName).toList();
    }

    @JsonIgnore
    public List<String> getGroupValues() {
        return groupBy.stream().map(Column::getCalcColumnSql).toList();
    }
}
