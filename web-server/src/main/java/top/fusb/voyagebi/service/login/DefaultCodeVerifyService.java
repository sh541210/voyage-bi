package top.fusb.voyagebi.service.login;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.example.server.common.utils.TTLCache;
import org.example.server.web.ErrorCode;
import org.example.server.web.exception.BizException;
import org.example.server.web.service.CodeVerifyService;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class DefaultCodeVerifyService implements CodeVerifyService {
    private final TTLCache<String, String> cache = new TTLCache<>(100_000, 1, TimeUnit.DAYS);

    @Override
    public void sendCode(String mobile, String key) {
        String code = RandomStringUtils.randomNumeric(6);
        cache.put(getCodeKey(key, mobile), code, 60, TimeUnit.SECONDS);
        log.info("[{}]{}验证码是{}", key, mobile, code);
    }

    @Override
    public void verifyCode(String key, String mobile, String verifyCode) {
        String code = cache.getIfPresent(getCodeKey(key, mobile));
        if (code == null) {
            throw new BizException(ErrorCode.define("验证码过期或不存在"));
        }
        if (!code.equals(verifyCode)) {
            throw new BizException(ErrorCode.define("验证码错误"));
        }
    }

    public String getCodeKey(String mobile, String key) {
        return key + ":" + mobile;
    }
}
