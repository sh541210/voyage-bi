package top.fusb.voyagebi.config;

import cn.dev33.satoken.stp.StpUtil;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.HandshakeInterceptor;
import top.fusb.voyagebi.service.ShareTokenService;
import top.fusb.voyagebi.websocket.base.JsonWebSocketHandler;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
@Slf4j
public class WebSocketConfig implements WebSocketConfigurer {

    protected final List<JsonWebSocketHandler<?, ?>> webSocketHandlers;
    private final ShareTokenService shareTokenService;

    @PostConstruct
    public void registerWebSocketHandlers() {
        log.info("web socket config init");
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        webSocketHandlers.forEach(i -> registry.addHandler(i, i.path())
                .setAllowedOrigins("*")
                .addInterceptors(new HandshakeInterceptor() {
            @Override
            public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                           WebSocketHandler wsHandler, Map<String, Object> attributes) {
                // 验证Token是否有效
                try {
                    Map<String, String> params = queryToParameters(request.getURI().getQuery());
                    if(params.containsKey("token")) {
                        String token = params.get("token");
                        Object loginId = StpUtil.getLoginIdByToken(token);
                        if(loginId!=null && StringUtils.isNotEmpty(loginId.toString())) {
                            attributes.put("loginId", loginId);
                            return true;
                        }
                    }
                    if(params.containsKey("shareToken") && params.containsKey("shareKey")) {
                        String shareToken = params.get("shareToken");
                        String shareKey = params.get("shareKey");
                        return shareTokenService.checkToken(shareToken, shareKey);
                    }
                } catch (Exception e) {
                    log.warn("Reject handle shake", e);
                    // 拒绝连接
                }
                return false;
            }

            @Override
            public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                       WebSocketHandler wsHandler, Exception exception) {
            }
        }));
    }

    private static Map<String, String> queryToParameters(String query) {
        Map<String, String> params = new HashMap<>();
        if(StringUtils.isEmpty(query)) {
            return params;
        }
        for (String pair : query.split("&")) {
            int idx = pair.indexOf("=");
            String key = idx > 0 ? URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8) : pair;
            String value = idx > 0 ? URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.UTF_8) : "";
            params.put(key, value);
        }
        return params;
    }
}
