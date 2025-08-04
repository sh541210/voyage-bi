package top.fusb.voyagebi.websocket;

import lombok.extern.slf4j.Slf4j;
import org.example.server.web.config.LoginModuleContext;
import org.example.server.web.domain.BaseLoginUser;
import org.example.server.web.utils.LoginUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.socket.WebSocketSession;
import top.fusb.voyagebi.domain.VO.DataResult;
import top.fusb.voyagebi.domain.VO.DataSet;
import top.fusb.voyagebi.domain.request.ChartDataRequest;
import top.fusb.voyagebi.persist.entity.QueryRecord;
import top.fusb.voyagebi.persist.mapper.QueryRecordMapper;
import top.fusb.voyagebi.service.impl.ChartService;
import top.fusb.voyagebi.websocket.base.JsonWebSocketHandler;

import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.Function;

import static org.example.server.web.utils.BeanUtils.copyAToBIgnoreId;

@Slf4j
public abstract class ChartRequestWebsocket<T> extends JsonWebSocketHandler<ChartDataRequest, T> {
    @Autowired
    private ChartService chartService;
    @Autowired
    private QueryRecordMapper queryRecordMapper;
    @Autowired
    private LoginModuleContext context;
    private static final ExecutorService executor = Executors.newCachedThreadPool();

    public void sendMessage(Function<String, Map<Long, T>> mapper) {
        sessions.values().forEach(session -> {
            Map<String, Object> attributes = session.getAttributes();
            Object shareKey = attributes.get("shareKey");
            if (shareKey != null) {
                Map<Long, T> results = mapper.apply(shareKey.toString());
                for (Map.Entry<Long, T> entry : results.entrySet()) {
                    ChartDataRequest request = new ChartDataRequest();
                    request.setChartId(entry.getKey());
                    sendResult(session, request, entry::getValue);
                }
            }
        });
    }

    public ChartRequestWebsocket(Class<ChartDataRequest> requestClass) {
        super(requestClass);
    }

    @Override
    public void handleRequest(WebSocketSession session, ChartDataRequest request) {
        Long start = System.currentTimeMillis();
        Map<String, Object> attributes = session.getAttributes();
        QueryRecord record = new QueryRecord();
        record.setStartTime(start);
        record.setChartId(request.getChartId());
        record.setState(0);
        record.setSource(request.getSource());
        record.setEnv(request.getEnv());
        queryRecordMapper.insert(record);
        if (attributes.containsKey("loginId")) {
            Object loginId = attributes.get("loginId");
            BaseLoginUser user = context.getLoginService().getLoginUser(loginId.toString());
            LoginUtils.setUser(user);
        }
        request.setClearMetadata(false);
        try {
            chartService.fetchData(request, result -> {
                record.setState(result.isSuccess() ? 1 : -1);
                record.setMessage(result.getMessage());
                DataSet data = result.getData();
                if (data != null) {
                    copyAToBIgnoreId(data.getMetadata(), record);
                    record.setHitCache(data.isHitCache());
                    record.setDatasourceId(data.getDatasourceId());
                    record.setDataSheetId(data.getDatasheetId());
                    record.setEnv(data.getEnv());
                }
                record.setEndTime(System.currentTimeMillis());
                executor.submit(() -> {
                    try {
                        queryRecordMapper.updateById(record);
                    } catch (Exception e) {
                        log.warn("Update query record error", e);
                    }
                });
                result.getData().setMetadata(null);
                sendResult(session, request, () -> sendData(result));
            });
        } catch (Exception e) {
            sendResult(session, request, () -> sendData(DataResult.failed(e)));
            log.error("Fetch data error", e);
        }
    }

    abstract T sendData(DataResult dataResult);
}
