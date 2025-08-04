package top.fusb.bi.data.jdbc.utils;

import lombok.extern.slf4j.Slf4j;
import top.fusb.bi.data.base.domin.QueryDataSet;
import top.fusb.bi.data.base.exception.DbException;
import top.fusb.bi.data.jdbc.domain.DataSourceConfig;
import top.fusb.bi.data.jdbc.domain.RdsParam;

import javax.sql.DataSource;
import java.sql.*;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.Date;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
public class JdbcUtils {

    private static final Map<RdsParam, DataSource> dataSourceMap = new ConcurrentHashMap<>();

    private static DataSource getDataSource(RdsParam rdsParam) {
        return dataSourceMap.computeIfAbsent(rdsParam, DataSourceConfig::createDataSource);
    }

    public static boolean testConnection(RdsParam rdsParam) {
        try (Connection conn = getDataSource(rdsParam).getConnection()) {
            return true;
        } catch (Exception e) {
            log.debug("连接失败, {}", rdsParam, e);
            log.warn("连接失败「{}」, {}", rdsParam, e.getMessage());
            return false;
        }
    }

    public static List<Map<String, Object>> query(RdsParam rdsParam, String sql) {
        List<Map<String, Object>> result = new ArrayList<>();
        try (Connection conn = getDataSource(rdsParam)
                .getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            ResultSetMetaData metaData = rs.getMetaData();
            int columnCount = metaData.getColumnCount();

            while (rs.next()) {
                Map<String, Object> row = new LinkedHashMap<>();
                for (int i = 1; i <= columnCount; i++) {
                    String columnName = metaData.getColumnLabel(i);
                    Object value = rs.getObject(i);
                    if (value instanceof LocalDateTime) {
                        value = Date.from(((LocalDateTime) value).atZone(ZoneId.systemDefault()).toInstant());
                    }
                    row.put(columnName, value);
                }
                result.add(row);
            }
        } catch (Exception e) {
            throw new DbException("查询异常, " + e.getMessage(), e);
        }
        return result;
    }

    public static QueryDataSet queryForDataSet(RdsParam rdsParam, String sql) {
        List<List<Object>> rows = new ArrayList<>();
        List<String> columnNames = new ArrayList<>();

        try (Connection conn = getDataSource(rdsParam).getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            ResultSetMetaData metaData = rs.getMetaData();
            int columnCount = metaData.getColumnCount();

            // 获取列名列表
            for (int i = 1; i <= columnCount; i++) {
                columnNames.add(metaData.getColumnLabel(i));
            }

            // 获取数据行
            while (rs.next()) {
                List<Object> row = new ArrayList<>();
                for (int i = 1; i <= columnCount; i++) {
                    Object value = rs.getObject(i);
                    if (value instanceof LocalDateTime) {
                        value = Date.from(((LocalDateTime) value).atZone(ZoneId.systemDefault()).toInstant());
                    }
                    row.add(value);
                }
                rows.add(row);
            }
        } catch (SQLException e) {
            log.warn("查询SQL异常", e);
            throw new DbException("查询SQL异常: " + e.getMessage(), e);
        }

        // 返回包含列名和行数据的结果
        QueryDataSet dataSet = new QueryDataSet();
        dataSet.setColumns(columnNames);
        dataSet.setRows(rows);
        return dataSet;
    }

    public static void exec(RdsParam rdsParam, String sql) {
        try (Connection conn = getDataSource(rdsParam).getConnection()) {
            conn.createStatement().executeQuery(sql);
        } catch (Exception e) {
            throw new RuntimeException("查询SQL异常", e);
        }
    }
}
