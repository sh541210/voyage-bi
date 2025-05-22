package top.fusb.bi.data.base.utils;

import java.util.Collection;
import java.util.List;
import java.util.stream.Stream;

public class SqlBuilder {
    public static String buildSql(String viewTable,
                                  List<String> groupBy,
                                  List<String> groupByValues,
                                  List<String> values,
                                  List<String> conditions,
                                  List<String> sorts) {
        if (values.isEmpty() && groupBy.isEmpty()) {
            return "SELECT 1 WHERE 1=0";
        }
        String sql = String.format("SELECT %s FROM (%s) tmp", String.join(",",
                Stream.of(groupByValues, values).flatMap(Collection::stream).toList()), viewTable);
        if (!conditions.isEmpty()) {
            sql += " WHERE " + String.join(" AND ", conditions);
        }
        if (!groupBy.isEmpty() && !values.isEmpty()) {
            sql += " GROUP BY " + String.join(",", groupBy);
        }
        if (sorts != null && !sorts.isEmpty()) {
            sql += " ORDER BY " + String.join(",", sorts);
        }
        return sql;
    }
}
