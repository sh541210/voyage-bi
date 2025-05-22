package top.fusb.voyagebi.utils;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;

import java.time.Duration;
import java.util.function.Function;

public class CacheManager<T> {

    private final Cache<String, CacheValue<T>> cache;
    private final Duration tmpDuration;

    public CacheManager(Duration duration) {
        this(duration, duration);
    }

    public CacheManager(Duration longDuration, Duration tmpDuration) {
        cache = CacheBuilder.newBuilder()
                .expireAfterWrite(longDuration)
                .build();
        this.tmpDuration = tmpDuration;
    }

    public record CacheValue<T>(T data, long timestamp) {
        public boolean isExpired(Duration duration) {
            return System.currentTimeMillis() - timestamp > duration.toMillis();
        }
    }

    public T get(String key,  boolean useLongCache) {
        return get(key, useLongCache, null);
    }

    public T get(String key, Function<String, T> valueGetter) {
        return get(key, false, valueGetter);
    }

    /**
     * 获取缓存的值
     * @param key 缓存的键
     * @param useLongCache 是否使用长期缓存规则
     * @return 缓存值（可能为 null）
     */
    public T get(String key, boolean useLongCache, Function<String, T> valueGetter) {
        CacheValue<T> cacheValue = cache.getIfPresent(key);
        if (cacheValue != null && !cacheValue.isExpired(useLongCache ? Duration.ofMillis(Long.MAX_VALUE) : tmpDuration)) {
            return cacheValue.data();
        }
        if(valueGetter !=null) {
            T value = valueGetter.apply(key);
            put(key, value);
            return value;
        }
        return null;
    }

    /**
     * 设置缓存值
     * @param key 缓存的键
     * @param value 缓存的值
     */
    public void put(String key, T value) {
        cache.put(key, new CacheValue<>(value, System.currentTimeMillis()));
    }

    /**
     * 移除缓存
     * @param key 要移除的键
     */
    public void invalidate(String key) {
        cache.invalidate(key);
    }

    /**
     * 清除所有缓存
     */
    public void clear() {
        cache.invalidateAll();
    }
}