package top.fusb.voyagebi.utils;

import net.sf.jsqlparser.JSQLParserException;
import org.apache.commons.lang3.time.DateFormatUtils;
import org.junit.jupiter.api.Test;
import top.fusb.bi.data.base.domin.DatasourceType;
import top.fusb.bi.data.base.parser.SqlHandler;
import top.fusb.bi.data.base.parser.VariablesSQLHandler;
import top.fusb.bi.data.jdbc.domain.RdsParam;
import top.fusb.bi.data.jdbc.utils.JdbcUtils;

import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;

public class TestCase1 {
    SqlHandler sqlHandler = new VariablesSQLHandler(DatasourceType.MySQL, Map.of());

    @Test
    public void test2() throws JSQLParserException {
        String finalSQL = sqlHandler.handleSQL("""
                SELECT * FROM (SELECT A,B,C)
                """);
        System.out.println(finalSQL);
    }

    @Test
    public void test3() throws Exception {
        String sql = "SELECT DATE_ADD(date, INTERVAL (-1 * ((WEEK(date,1)-1) Î% 1) * 7) DAY) FROM a";
        sql = """
                SELECT * FROM ( SELECT count(id) AS d FROM B as t order by count(id), t.a) TMP LIMIT 100
                """;
        String finalSQL = sqlHandler.handleSQL(sql);
        System.out.println(finalSQL);
    }

    public static int calcDynamicTTL(List<Long> timestamps) {
        List<Long> intervals = IntStream.range(1, timestamps.size())
                .mapToObj(i -> (timestamps.get(i) - timestamps.get(i - 1)) / 1000)
                .toList();
        if (intervals.size() < 3) {
            return 300;
        }

        double predicted = intervals.get(0);
        double alpha = 0.9;
        for (int i = 1; i < intervals.size(); i++) {
            predicted = alpha * intervals.get(i) + (1 - alpha) * predicted;
            alpha *= 0.95;
        }

        long currentTime = System.currentTimeMillis();
        long lastUpdate = timestamps.isEmpty() ? 0 : timestamps.get(timestamps.size() - 1);
        long elapsed = (currentTime - lastUpdate) / 1000;
        long remaining = Math.max((long) predicted - elapsed, 0);
        int ttl = (int) (remaining);
        return Math.min(Math.max(ttl, 60), 3600);
    }

    @Test
    public void test5() {
        List<Map<String, Object>> john = JdbcUtils.query(new RdsParam(
                        "jdbc:mysql://localhost:3306/test", "root", "root", "",
                        Map.of("sessionVariables", "information_schema_stats_expiry=0"))
                , "SELECT UNIX_TIMESTAMP(MAX(IFNULL(UPDATE_TIME, CREATE_TIME)))*1000 AS Update_time\n" +
                        "FROM INFORMATION_SCHEMA.TABLES\n" +
                        "WHERE TABLE_NAME IN (\"TEST_CACHE\")\n"
        );
        System.out.println(john.stream().map(
                i -> DateFormatUtils.format(Long.parseLong(i.get("Update_time").toString()),
                        "yyyy-MM-dd HH:mm:ss")).toList());
    }
}
