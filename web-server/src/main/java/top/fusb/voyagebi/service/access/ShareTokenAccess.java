package top.fusb.voyagebi.service.access;

import cn.dev33.satoken.context.model.SaRequest;
import cn.dev33.satoken.secure.SaSecureUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.example.server.web.ErrorCode;
import org.example.server.web.exception.BizException;
import org.example.server.web.interfaces.TokenAccessHandler;
import org.example.server.web.utils.LoginUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import top.fusb.voyagebi.client.utils.SignatureUtils;
import top.fusb.voyagebi.config.RequestBodyWrapper;
import top.fusb.voyagebi.domain.ClientAccessible;
import top.fusb.voyagebi.service.ShareTokenService;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * 验签&分享token拦截
 */
@Slf4j
@Component
public class ShareTokenAccess implements TokenAccessHandler<Boolean>, ShareTokenService {
    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Override
    public boolean login() {
        return false;
    }

    @Override
    public Boolean handleAccess(HandlerMethod handlerMethod, SaRequest request) {
        LoginUtils.clearId();
        // 验签
        boolean checked = checkSign(request);
        if (!checked) {
            return false;
        }
        if (handlerMethod.hasMethodAnnotation(ClientAccessible.class)) {
            return true;
        }
        String token = request.getHeader("X-Share-Token");
        String shareKey = request.getHeader("X-Share-Key");
        return checkToken(token, shareKey);
    }

    @Override
    public boolean checkToken(String token, String shareKey) {
        if (StringUtils.isEmpty(token) || StringUtils.isEmpty(shareKey)) {
            return false;
        }
        String[] parts = token.split(":");
        if (parts.length != 3) {
            return false;
        }

        String tokenId = parts[0];
        String timestamp = parts[1];
        String sign = parts[2];

        // 校验时间戳有效性（5分钟内）
        long currentTime = System.currentTimeMillis();
        if (currentTime - Long.parseLong(timestamp) > 5 * 60 * 1000) {
            return false;
        }

        // 校验签名
        String expectedSign = SaSecureUtil.sha256(tokenId + timestamp + shareKey);
        if (!sign.equals(expectedSign)) {
            return false;
        }

        // 检查 Redis 中是否存在未过期的令牌
        return redisTemplate.hasKey("share_token:" + tokenId);
    }

    private boolean checkSign(SaRequest request) {
        Map<String, String> headers = Stream.of("Signature", "Digest", "Timestamp")
                .collect(Collectors.toConcurrentMap(i -> i, i -> request.getHeader(i, "")));
        if (headers.values().stream().allMatch(String::isEmpty)) {
            return false;
        }
        String requestPath = request.getRequestPath();
        String params = request.getParamMap().entrySet()
                .stream().map(i -> i.getKey() + "=" + i.getValue())
                .collect(Collectors.joining("&"));
        if (!request.getParamMap().isEmpty()) {
            requestPath += "?" + params;
        }
        boolean verify = SignatureUtils.verify(headers,
                request.getMethod(), requestPath,
                getRequestBody(request),
                keyId -> {
                    if (keyId.equals("client-o2o")) {
                        return "7K+HlnqpLLyH3UB=";
                    }
                    return "VOYAGE BI";
                });
        if (!verify) {
            throw new BizException(ErrorCode.define(-10, "签名验证失败"));
        }
        return true;
    }

    private String getRequestBody(SaRequest request) {
        if (request.getSource() instanceof HttpServletRequest source) {
            if (source instanceof RequestBodyWrapper wrapper) {
                String s = new String(wrapper.getRequestBody());
                if (StringUtils.isEmpty(s)) {
                    return "null";
                }
                return s;
            }
        }
        return "null";
    }

    @Override
    public String generateToken(String key) {
        String tokenId = UUID.randomUUID().toString();
        String timestamp = String.valueOf(System.currentTimeMillis());
        String sign = SaSecureUtil.sha256(tokenId + timestamp + key);
        redisTemplate.opsForValue().set("share_token:" + tokenId, "active", 60, TimeUnit.MINUTES);
        return tokenId + ":" + timestamp + ":" + sign;
    }
}
