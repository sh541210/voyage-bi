package top.fusb.bi.data.base.client;

import top.fusb.bi.data.base.domin.DatasourceType;
import top.fusb.bi.data.base.domin.QueryDataSet;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

public interface DataClient {
    List<String> getTableNames(String sql);

    Long getDataUpdateTime(String sql);

    boolean testConnection();

    CompletableFuture<QueryDataSet> getDataSet(String sql, Map<String, Object> variables);

    default CompletableFuture<QueryDataSet> getDataSet(String sql) {
        return getDataSet(sql, Map.of());
    }

    DatasourceType getDsType();

    void shutdown();
}
