package top.fusb.voyagebi.websocket;

import top.fusb.voyagebi.domain.VO.DataResult;

public interface DataUpdater {
    void useData(DataResult data);
}
