package top.fusb.voyagebi.service.manager;

import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import org.example.server.web.exception.BizException;
import org.springframework.stereotype.Component;
import top.fusb.bi.data.base.client.AbstractDataClient;
import top.fusb.bi.data.base.client.DataClient;
import top.fusb.bi.data.base.domin.DatasourceType;
import top.fusb.bi.data.jdbc.client.MysqlDataClient;
import top.fusb.bi.data.jdbc.client.SelectDBDataClient;
import top.fusb.bi.data.jdbc.domain.RdsParam;
import top.fusb.voyagebi.domain.DatasourceCfg;
import top.fusb.voyagebi.persist.entity.Datasource;
import top.fusb.voyagebi.persist.mapper.DatasourceMapper;
import top.fusb.voyagebi.service.facade.SqlOptimizer;
import top.fusb.voyagebi.utils.CacheManager;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import static org.example.server.web.utils.BeanUtils.aToB;

@RequiredArgsConstructor
@Component
public class DataClientManager {
    private static final int QUERY_PARALLELISM = 50;
    private final Map<DatasourceCfg, DataClient> clientMap = new ConcurrentHashMap<>();
    private final DatasourceMapper datasourceMapper;
    private final CacheManager<Datasource> dsCache = new CacheManager<>(Duration.ofSeconds(3));

    @PreDestroy
    public void preDestroy() {
        // 关闭所有连接
        Runtime.getRuntime().addShutdownHook(new Thread(() -> clientMap.values().forEach(DataClient::shutdown)));
    }

    private DataClient createClient(DatasourceType dsType, DatasourceCfg cfg) {
        AbstractDataClient client = switch (dsType) {
            case MySQL -> new MysqlDataClient(30, aToB(cfg, RdsParam.class));
            case SelectDB -> new SelectDBDataClient(QUERY_PARALLELISM, aToB(cfg, RdsParam.class));
            default -> throw new IllegalStateException("Not supported");
        };
        client.setSqlOptimizer(new SqlOptimizer(dsType));
        return client;
    }

    public DataClient getDataClient(DatasourceType datasourceType,
                                    DatasourceCfg cfg) {
        return clientMap.computeIfAbsent(cfg, i -> createClient(datasourceType, cfg));
    }

    public DataClient getDataClient(Long datasourceId, String env) {
        Datasource datasource = dsCache.get(datasourceId.toString(), datasourceMapper::selectById);
        DatasourceCfg cfg = datasource.getCfgStore().getCfg(env);
        if (cfg == null) {
            throw new BizException(-30, "没有找到数据源配置");
        }
        return getDataClient(datasource.getType(), cfg);
    }
}
