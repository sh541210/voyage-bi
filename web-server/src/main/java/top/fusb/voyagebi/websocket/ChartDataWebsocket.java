package top.fusb.voyagebi.websocket;

import org.springframework.stereotype.Service;
import top.fusb.voyagebi.domain.VO.DataResult;
import top.fusb.voyagebi.domain.request.ChartDataRequest;

import java.util.List;
import java.util.Map;

@Deprecated
@Service
public class ChartDataWebsocket extends ChartRequestWebsocket<List<Map<String, Object>>> {


    public ChartDataWebsocket() {
        super(ChartDataRequest.class);
    }

    @Override
    public String path() {
        return "/chart/data";
    }

    @Override
    List<Map<String, Object>> sendData(DataResult dataResult) {
        return dataResult.toMapList();
    }
}
