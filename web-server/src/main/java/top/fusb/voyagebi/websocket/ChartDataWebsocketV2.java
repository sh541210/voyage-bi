package top.fusb.voyagebi.websocket;

import top.fusb.voyagebi.domain.VO.DataResult;
import top.fusb.voyagebi.domain.request.ChartDataRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class ChartDataWebsocketV2 extends ChartRequestWebsocket<DataResult> {

    public ChartDataWebsocketV2() {
        super(ChartDataRequest.class);
    }

    @Override
    public String path() {
        return "/ws/chart/data/v2";
    }

    @Override
    DataResult sendData(DataResult dataResult) {
        return dataResult;
    }
}
