package top.fusb.voyagebi.websocket.base;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.example.server.web.Result;

@EqualsAndHashCode(callSuper = true)
@Data
public class WebSocketResult<T> extends Result<T> {
    private String requestId;
}