package top.fusb.voyagebi.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import top.fusb.bi.data.base.utils.SqlUtils;

import java.io.Serializable;

/**
 * 条件对象，继承自Column，代表图表列的条件信息（如过滤条件）
 * 用于在SQL中应用筛选条件
 */
@EqualsAndHashCode(callSuper = true)  // 继承自Column，重写equals和hashCode方法
@Data  // 自动生成getter、setter等方法
public class Condition extends Column implements Serializable {

    /**
     * 条件的值，可能是单一值或者是一个范围/集合
     */
    private Object value;

    /**
     * 条件的操作符，如EQ、NE、IN等
     */
    private ConditionOperation operation;

    /**
     * 将条件转化为SQL字符串的表达式
     * 根据列的SQL和条件值生成条件表达式
     *
     * @return SQL条件表达式
     */
    @Override
    public String toString() {
        // 如果有列的表达式（如自定义的复杂条件），则返回该表达式
        if (ConditionOperation.EXPR.equals(operation) && getExpression() != null && !getExpression().isEmpty())
            return getExpression();
        // 否则生成基于列SQL和条件值的标准SQL条件
        return String.format(operation.getFormat(), getColumnSql(),
                SqlUtils.toStringValue(value, true));  // SqlUtils用于转化值为SQL的格式
    }

    /**
     * 条件操作符的枚举类
     * 定义了常见的SQL条件操作符及其格式
     */
    @AllArgsConstructor  // 生成构造器
    @Getter  // 生成getter方法
    public enum ConditionOperation {

        /**
         * 不等于操作符
         */
        NE("%s != %s"),

        /**
         * 等于操作符
         */
        EQ("%s = %s"),

        /**
         * 包含在范围中的操作符（IN）
         */
        IN("%s in %s"),

        IS_NOT_NULL("%s IS NOT NULL"),

        IS_NULL("%s IS NULL"),

        EXPR(""),
        ;

        /**
         * 操作符的SQL格式
         */
        private final String format;
    }
}
