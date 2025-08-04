package top.fusb.bi.data.jdbc.client;

import lombok.extern.slf4j.Slf4j;
import net.sf.jsqlparser.parser.CCJSqlParserUtil;
import net.sf.jsqlparser.statement.Statement;
import net.sf.jsqlparser.statement.select.Select;
import net.sf.jsqlparser.util.TablesNamesFinder;
import top.fusb.bi.data.base.client.AbstractDataClient;
import top.fusb.bi.data.base.client.DataClient;
import top.fusb.bi.data.base.domin.QueryDataSet;
import top.fusb.bi.data.base.utils.SqlUtils;
import top.fusb.bi.data.jdbc.domain.RdsParam;
import top.fusb.bi.data.jdbc.utils.JdbcUtils;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;


@Slf4j
public abstract class JdbcDataClient extends AbstractDataClient implements DataClient {
    protected final RdsParam param;

    public JdbcDataClient(int parallelism, RdsParam param) {
        super(parallelism);
        this.param = param;
    }

    @Override
    public List<String> getTableNames(String sql) {
        try {
            Statement statement = CCJSqlParserUtil.parse(sql, parser -> parser.withAllowComplexParsing(true)
                    .withTimeOut(5 * 1000L));
            if (statement instanceof Select) {
                TablesNamesFinder<Void> tablesNamesFinder = new TablesNamesFinder<>();
                return new ArrayList<>(tablesNamesFinder.getTables(statement).stream().map(SqlUtils::removePairedBackticks).toList());
            }
        } catch (Exception e) {
            throw new RuntimeException("解析SQL异常", e);
        }
        return new ArrayList<>();
    }

    @Override
    public Long getDataUpdateTime(String origin) {
        if (origin == null || origin.trim().isEmpty()) {
            return null;
        }
        if (!testConnection()) {
            return null;
        }
        String handledSQL = handleSQLBeforeRun(origin, Map.of());
        try {
            List<String> tables = getTableNames(handledSQL);
            if (!tables.isEmpty()) {
                String tablesStr = tables.stream().map(j -> "\"" + j + "\"").collect(Collectors.joining(","));
                String sql = String.format("""
                        SELECT UNIX_TIMESTAMP(MAX(IFNULL(UPDATE_TIME, CREATE_TIME)))*1000 AS Update_time
                        FROM INFORMATION_SCHEMA.TABLES
                        WHERE TABLE_NAME IN (%s)
                        """, tablesStr);
//                String sql = String.format("SHOW TABLE STATUS WHERE Name in (%s)", );
                List<Map<String, Object>> result = JdbcUtils.query(param, sql);
                if (!result.isEmpty()) {
                    return result.stream().map(i -> {
                                Object updateTime = i.get("Update_time");
                                Object createTime = i.get("Create_time");
                                return Stream.of(updateTime, createTime).filter(Objects::nonNull).toList();
                            }).flatMap(Collection::stream)
                            .map(i -> {
                                if (i instanceof Date date) {
                                    return date.getTime();
                                } else if (i instanceof Long l) {
                                    return l;
                                }
                                return null;
                            })
                            .filter(Objects::nonNull)
                            .max(Long::compareTo)
                            .orElse(null);
                }
            }
            return null;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public boolean testConnection() {
        return JdbcUtils.testConnection(param);
    }

    @Override
    protected QueryDataSet queryForDataSet(String sql) {
        log.info("查询SQL: {}", sql);
        return JdbcUtils.queryForDataSet(param, sql);
    }
}
