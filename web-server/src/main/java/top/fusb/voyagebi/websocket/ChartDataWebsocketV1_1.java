package top.fusb.voyagebi.websocket;

import top.fusb.voyagebi.domain.VO.DataResult;
import top.fusb.voyagebi.domain.request.ChartDataRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

@Deprecated
@Service
public class ChartDataWebsocketV1_1 extends ChartRequestWebsocket<ChartDataWebsocketV1_1.V1_1Data> {


    public ChartDataWebsocketV1_1() {
        super(ChartDataRequest.class);
    }

    @Override
    public String path() {
        return "/ws/chart/data/1.1";
    }

    @Override
    V1_1Data sendData(DataResult dataResult) {
        List<Map<String, Object>> mapList = dataResult.toMapList();
        Long total = dataResult.getData().getTotal();
        return new V1_1Data(mapList, total);
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class V1_1Data implements Serializable {
        private List<Map<String, Object>> data;
        private Long total;
    }
}
