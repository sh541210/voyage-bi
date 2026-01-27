package top.fusb.voyagebi.websocket.base;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.google.common.util.concurrent.ThreadFactoryBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import top.fusb.voyagebi.base.domain.utils.JacksonUtils;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Slf4j
public abstract class JsonWebSocketHandler<T extends WebSocketRequest, R> extends TextWebSocketHandler {
    protected final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private static final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");

    static {
        JacksonUtils.setMapper(mapper -> {
            SimpleModule module = new SimpleModule().addSerializer(Date.class, new JsonSerializer<>() {
                @Override
                public void serialize(Date date, JsonGenerator jsonGenerator, SerializerProvider serializerProvider) throws IOException {
                    String formattedDate = JsonWebSocketHandler.dateFormat.format(date);
                    jsonGenerator.writeString(formattedDate);
                }
            });
            mapper.registerModule(module);
        });
    }

    private final Class<T> requestClass;
    private final ExecutorService POOL = Executors.newCachedThreadPool(new ThreadFactoryBuilder().setNameFormat("websocket-handler-%d").build());

    public JsonWebSocketHandler(Class<T> requestClass) {
        this.requestClass = requestClass;
    }

    public abstract String path();

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        // 连接关闭后
        log.info(path() + " Connection closed, session Id: " + session.getId());
        sessions.remove(session.getId());
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        // 连接建立后
        log.info(path() + " Connection established, session Id: " + session.getId());
        sessions.put(session.getId(), session);
    }

    public abstract void handleRequest(WebSocketSession session, T request);

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        POOL.submit(() -> handleMessage(session, message));
    }

    private void handleMessage(WebSocketSession session, TextMessage message) {
        String payload = message.getPayload();
        T request;
        try {
            request = JacksonUtils.parseObject(payload, requestClass);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        handleRequest(session, request);
    }

    private void sendMessage(WebSocketSession session, TextMessage message) {
        if (session.isOpen()) {
            try {
                session.sendMessage(message);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
    }

    public interface ResultSupplier<V> {
        V apply() throws Exception;
    }

    protected synchronized void sendResult(WebSocketSession session, T request, ResultSupplier<R> resultSupplier) {
        WebSocketResult<R> webSocketResult = new WebSocketResult<>();
        webSocketResult.setRequestId(request.getRequestId());
        try {
            R result = resultSupplier.apply();
            webSocketResult.setData(result);
            webSocketResult.setSuccess(true);
        } catch (Exception e) {
            log.error("处理websocket请求异常", e);
            webSocketResult.setMessage(e.getMessage());
            webSocketResult.setSuccess(false);
        }
        JacksonUtils.setMapper(mapper -> {
            mapper.registerModule(new JavaTimeModule());
            mapper.setDateFormat(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));
        });
        TextMessage textMessage = new TextMessage(JacksonUtils.toJsonStr(webSocketResult));
        sendMessage(session, textMessage);
    }
}
