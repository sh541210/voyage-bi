package top.fusb.voyagebi.service.cache;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import top.fusb.voyagebi.domain.VO.DataSet;

import java.time.Duration;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Slf4j
public class RedisCacheProvider<T> implements CacheProvider<T> {
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;
    private final Duration timeout;

    public RedisCacheProvider(
            RedisTemplate<String, Object> redisTemplate,
            int timeoutMinutes
    ) {
        this.redisTemplate = redisTemplate;
        objectMapper = new ObjectMapper().registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        timeout = Duration.ofMinutes(timeoutMinutes);
    }

    @Override
    public T get(String key) {
        try {
            Object json = redisTemplate.opsForValue().get(key);
            return json != null ? (T) objectMapper.readValue(json.toString(), DataSet.class) : null;
        } catch (JsonProcessingException e) {
            throw new RuntimeException("反序列化失败", e);
        }
    }

    @Override
    public Long getExpireTTLSeconds(String key) {
        return redisTemplate.getExpire(key, TimeUnit.SECONDS);
    }

    @Override
    public Long getCreateTime(String key) {
        Object o = redisTemplate.opsForValue().get(key + ":create_time");
        if (o != null) {
            return Long.parseLong(o.toString());
        }
        return null;
    }

    @Override
    public void put(String key, T data) {
        put(key, data, timeout);
    }

    @Override
    public void put(String key, T data, Duration timeout) {
        try {
            String json = objectMapper.writeValueAsString(data);
            redisTemplate.opsForValue().set(key, json, timeout);
            redisTemplate.opsForValue().set(key + ":create_time", System.currentTimeMillis());
        } catch (JsonProcessingException e) {
            throw new RuntimeException("序列化失败", e);
        }
    }

    @Override
    public void invalidate(String key) {
        redisTemplate.delete(key);
    }

    @Override
    public void invalidateAll() {
        Set<String> keys = redisTemplate.keys("*");
        if (!keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }
}