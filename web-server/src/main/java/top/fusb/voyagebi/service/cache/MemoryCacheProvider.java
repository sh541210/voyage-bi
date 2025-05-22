package top.fusb.voyagebi.service.cache;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import lombok.extern.slf4j.Slf4j;
import top.fusb.voyagebi.domain.VO.DataSet;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Slf4j
public class MemoryCacheProvider implements CacheProvider<DataSet> {
    private final Cache<String, DataSet> cache;
    private final Cache<String, Long> createTimeCache;

    public MemoryCacheProvider(
            int expireMinutes,
            int maxSize
    ) {
        cache = CacheBuilder.newBuilder()
                .expireAfterWrite(expireMinutes, TimeUnit.MINUTES)
                .maximumSize(maxSize)
                .build();
        createTimeCache = CacheBuilder.newBuilder()
                .expireAfterWrite(expireMinutes, TimeUnit.MINUTES)
                .maximumSize(maxSize)
                .build();
    }

    @Override
    public DataSet get(String key) {
        return cache.getIfPresent(key);
    }

    @Override
    public Long getExpireTTLSeconds(String key) {
        return 0L;
    }

    @Override
    public Long getCreateTime(String key) {
        return createTimeCache.getIfPresent(key + ":create_time");
    }

    @Override
    public void put(String key, DataSet data) {
        createTimeCache.put(key + ":create_time", System.currentTimeMillis());
        cache.put(key, data);
    }

    @Override
    public void put(String key, DataSet data, Duration timeout) {
        // TODO
        cache.put(key, data);
    }

    @Override
    public void invalidate(String key) {
        cache.invalidate(key);
    }

    @Override
    public void invalidateAll() {
        cache.invalidateAll();
    }
}