package top.fusb.bi.data.jdbc.domain;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import top.fusb.bi.data.base.exception.DbException;

import javax.sql.DataSource;

@Slf4j
public class DataSourceConfig {

    public static DataSource createDataSource(RdsParam rdsParam) {
        try {
            HikariConfig config = new HikariConfig();
            config.setJdbcUrl(rdsParam.getUrl());
            config.setUsername(rdsParam.getUsername());
            config.setPassword(rdsParam.getPassword());

            // 设置连接池的参数
            config.setMaximumPoolSize(100);  // 根据需要调整
            config.setMinimumIdle(20);       // 根据需要调整
            config.setIdleTimeout(60000);    // 60秒
            config.setConnectionTimeout(30000); // 30秒
            config.setMaxLifetime(1800000);  // 30分钟

            // 设置连接测试查询
            config.setConnectionTestQuery("SELECT 1");

            // 其他参数
            config.addDataSourceProperty("cachePrepStmts", "true");
            config.addDataSourceProperty("prepStmtCacheSize", "250");
            config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");
            config.addDataSourceProperty("useConfigs", "maxPerformance");
            rdsParam.getParams().forEach(config::addDataSourceProperty);

            return new HikariDataSource(config);
        } catch (Exception e) {
            throw new DbException("连接失败, " + e.getMessage());
        }
    }
}
