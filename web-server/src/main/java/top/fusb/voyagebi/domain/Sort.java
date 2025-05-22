package top.fusb.voyagebi.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.EqualsAndHashCode;
import top.fusb.bi.data.base.utils.SqlUtils;

import java.io.Serializable;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * 排序类，扩展自 {@link SortBy}，用于定义排序的字段和顺序。
 * <p>
 * 该类支持自定义排序，可以按特定字段进行升序或降序排序，并且可以根据条件动态生成排序 SQL。
 * </p>
 */
@EqualsAndHashCode(callSuper = true)
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class Sort extends SortBy implements Serializable {

    /**
     * 排序字段的名称
     */
    private String name;

    /**
     * 排序字段的值，支持多值排序
     */
    private List<Object> values;

    /**
     * 是否为自定义排序
     */
    private boolean custom;

    /**
     * 根据排序类型生成排序 SQL 字符串。
     * <p>
     * 如果是自定义排序，则通过 CASE WHEN SQL 语句生成自定义排序逻辑。
     * 否则，返回按字段名和排序顺序（升序或降序）生成的排序 SQL。
     * </p>
     *
     * @return 排序 SQL 字符串
     */
    @Override
    public String toString() {
        // 自定义排序
        // 返回默认的字段排序
        if (custom && values != null && !values.isEmpty()) {
            // 如果是降序，则反转值的顺序
            if (OrderBy.DESC.equals(orderBy)) Collections.reverse(values);
            // 使用 CASE WHEN 语句生成自定义排序 SQL
            return "CASE " + IntStream.range(0, values.size())
                    .mapToObj(idx -> String.format("WHEN %s = %s THEN %s",
                            name, SqlUtils.toStringValue(values.get(idx), true), idx + 1))
                    .collect(Collectors.joining(" ")) + " ELSE " + (values.size() + 1) + " END ASC";
        } else return Optional.ofNullable(orderBy).map(i -> name + " " + i).orElse(name);
    }
}
