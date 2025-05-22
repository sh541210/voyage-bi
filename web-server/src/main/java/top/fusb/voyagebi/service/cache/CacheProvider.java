package top.fusb.voyagebi.service.cache;

import java.time.Duration;

public interface CacheProvider<T> {
    T get(String key);

    Long getExpireTTLSeconds(String key);

    Long getCreateTime(String key);

    void put(String key, T data);

    void put(String key, T data, Duration timeout);

    void invalidate(String key);

    void invalidateAll();
}