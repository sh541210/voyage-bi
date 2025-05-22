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
            sendResult(session, request, () -> sendData(result));
        });
    }

    abstract T sendData(DataResult dataResult);
}
