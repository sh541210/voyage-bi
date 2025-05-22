package top.fusb.voyagebi.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import top.fusb.voyagebi.domain.enums.DateFormat;

import java.io.Serializable;
import java.util.Map;
import java.util.Optional;

/**
 * 图表列对象
 * 用于存储图表的数据列信息
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)  // 仅序列化非null属性
@JsonIgnoreProperties(ignoreUnknown = true)  // 忽略未识别的属性
public class Column implements Serializable {
    /**
     * 列的主键，支持从ID或其他属性获取
     */
    private Object key;

    /**
     * 列ID
     */
    private Long id;

    /**
     * 列名称
     */
    private String name;

    /**
     * 函数（如聚合函数）
     */
    private String func;

    /**
     * 列的表达式
     */
    private String expression;

    /**
     * 列的别名
     */
    private String alias;

    /**
     * 排序规则
     */
    private Sort sort;

    /**
     * 日期格式
     */
    private DateFormat dateFormat;

    private int dateFormatInterval = 1;

    /**
     * 值类型（如：String、Integer等）
     */
    @JsonIgnore
    private String valueType;

    /**
     * 列的描述信息
     */
    private String desc;

    // 前端显示时使用的额外属性，SQL处理中不涉及
    private Map<String, Object> valueProps;

    @Deprecated  // 已弃用
    private boolean canBeSorted;

    @Deprecated  // 已弃用
    private String customData;

    // 兼容旧数据结构
    public Long getKey() {
        return Optional.ofNullable(key).map(i -> Long.parseLong(i.toString())).orElse(id);
    }

    /**
     * 获取计算后的列的SQL表达式（例如：SELECT <column> AS "<alias>"）
     *
     * @return 计算后的SQL列
     */
    @JsonIgnore
    public String getCalcColumnSql() {
        return String.format("%s AS \"%s\"", getColumnSql(), getFinalName());
    }

    /**
     * 获取最终列名，如果存在别名，则返回别名，若别名不存在则返回描述或者原始列名
     *
     * @return 最终列名
     */
    @JsonIgnore
    public String getFinalName() {
        if (alias != null && !alias.isEmpty()) return alias;
        if (desc != null && !desc.isEmpty()) return desc;
        return name;
    }

    /**
     * 获取列的SQL表达式，如果有函数，则返回如`COUNT(DISTINCT <column>)`
     *
     * @return 列的SQL表达式
     */
    @JsonIgnore
    public String getColumnSql() {
        String column;
        if (expression != null && !expression.isEmpty()) column = expression;
        else {
            column = getColumnName();
            if (func != null && !func.isEmpty()) {
                if ("DISTINCT_COUNT".equals(func)) return "COUNT(DISTINCT " + column + ")";
                column = String.format("%s(%s)", func, column);
            }
        }
        return column;
    }

    /**
     * 获取列名称，若列类型是日期，还会根据日期格式进行转换
     *
     * @return 列名称
     */
    @JsonIgnore
    public String getColumnName() {
        if (dateFormat != null) {
            return dateFormat.format(DateFormat.ValueType.valueOf(valueType),
                    name, dateFormatInterval);
        }
        return String.format("`%s`", name);
    }
}
