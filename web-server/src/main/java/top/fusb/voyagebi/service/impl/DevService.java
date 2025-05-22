package top.fusb.voyagebi.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import top.fusb.voyagebi.domain.VO.DataResult;
import top.fusb.voyagebi.domain.request.SqlQueryRequest;
import top.fusb.voyagebi.service.facade.DataClientFacade;
import top.fusb.voyagebi.service.facade.DataQueryRequest;

@Service
@RequiredArgsConstructor
public class DevService {
    private final DataClientFacade dataClientFacade;

    public DataResult queryForDataResult(SqlQueryRequest sqlQueryRequest) {
        if (sqlQueryRequest.getSqlText().isEmpty()) return DataResult.empty();
        return dataClientFacade.queryForResult(DataQueryRequest.builder()
                .datasourceId(sqlQueryRequest.getDatasourceId())
                .limit(500)
                .sqlText(sqlQueryRequest.getSqlText())
                .variables(sqlQueryRequest.getParameters())
                .forceRefresh(true)
                .env(sqlQueryRequest.getEnv())
                .build());
    }
}
