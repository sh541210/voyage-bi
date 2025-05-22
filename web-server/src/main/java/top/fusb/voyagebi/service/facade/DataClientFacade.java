package top.fusb.voyagebi.service.facade;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import top.fusb.bi.data.base.client.DataClient;
import top.fusb.bi.data.base.domin.QueryDataSet;
import top.fusb.voyagebi.domain.VO.DataResult;
import top.fusb.voyagebi.domain.VO.DataSet;
import top.fusb.voyagebi.service.cache.CacheProvider;
import top.fusb.voyagebi.service.manager.DataClientManager;
import top.fusb.voyagebi.service.manager.DataSheetMetadataManager;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.function.Consumer;

import static org.example.server.web.utils.BeanUtils.copyAToB;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataClientFacade {
    private final CacheProvider<DataSet> cache;
    private final DataSheetMetadataManager metadataManager;
    private final DataClientManager dataClientManager;

    public DataSet queryForDataSet(DataQueryRequest request) {
        try {
            return queryForData(request).get();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException(e);
        }
    }

    public DataResult queryForResult(DataQueryRequest request) {
        Consumer<DataResult> consumer = request.getDataResultConsumer();
        // 根据请求生成缓存的key
        String cacheKey = request.generateCacheKey();
        // 1. 从缓存中读取数据
        DataSet cachedData = cache.get(cacheKey);
        // 2. 如果缓存命中，立即消费缓存数据
        if (cachedData != null && consumer != null) {
            consumer.accept(DataResult.success(cachedData.hitCache()));
        }
        // 使用传入的 consumer 处理缓存数据
        if (cachedData == null || request.isForceRefresh() ||
                metadataManager.isForceRefresh(cacheKey, request.getDataSheetId())) {
            // 3. 查询数据并消费
            CompletableFuture<DataSet> future = queryForData(request);
            if (consumer != null) {
                future.thenAccept(updatedData -> {
                    // 更新缓存
                    cache.put(cacheKey, updatedData, metadataManager.getDynamicTTLDuration(request.getDataSheetId()));
                    // 处理查询后的数据
                    consumer.accept(DataResult.success(updatedData));  // 使用传入的 consumer 处理查询结果
                }).exceptionally(ex -> {
                    // 处理查询异常
                    consumer.accept(DataResult.failed(ex));
                    cache.invalidate(cacheKey);
                    return null;
                });
            } else {
                try {
                    DataSet dataSet = future.get();
                    cache.put(cacheKey, dataSet, metadataManager.getDynamicTTLDuration(request.getDataSheetId()));
                    return DataResult.success(dataSet);
                } catch (InterruptedException | ExecutionException e) {
                    return DataResult.failed(e);
                }
            }
        }
        return DataResult.success(cachedData);
    }

    private CompletableFuture<DataSet> queryForData(DataQueryRequest request) {
        String sql = request.getFinalSql();
        if (sql.trim().isEmpty()) {
            return CompletableFuture.completedFuture(DataSet.ofEmpty());
        }
        // 查询数据源并替换变量
        DataClient client = dataClientManager.getDataClient(request.getDatasourceId(), request.getEnv());
        if (request.isCountSql()) {
            return client.getDataSet(String.format("SELECT COUNT(*) AS COUNT FROM (%s) COUNT_TEMP\n", sql), request.getVariables())
                    .thenCompose(data -> CompletableFuture.completedFuture(DataSet.ofQuery(data)));
        }
        CompletableFuture<QueryDataSet> future = client.getDataSet(sql, request.getVariables());
        return future.thenCompose(data -> {
            DataSet dataSet = DataSet.ofQuery(data);
            if (request.isCalcTotal()) {
                DataQueryRequest countReq = DataQueryRequest.builder().build();
                copyAToB(request, countReq, (a, b) -> {
                    b.setCountSql(true);
                    b.setLimit(null);
                    b.setPagination(null);
                });
                return queryForData(countReq).thenApply(countResult -> {
                    dataSet.setTotal(Long.parseLong(countResult.getOne().toString()));
                    if (request.isClearMetadata()) {
                        dataSet.setMetadata(null);
                    }
                    return dataSet;
                });
            }
            if (request.isClearMetadata()) {
                dataSet.setMetadata(null);
            }
            return CompletableFuture.completedFuture(dataSet);
        });
    }
}
