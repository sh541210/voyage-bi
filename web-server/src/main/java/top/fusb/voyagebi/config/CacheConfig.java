package top.fusb.voyagebi.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.core.RedisTemplate;
import top.fusb.voyagebi.domain.VO.DataSet;
import top.fusb.voyagebi.service.cache.CacheProvider;
import top.fusb.voyagebi.service.cache.MemoryCacheProvider;
import top.fusb.voyagebi.service.cache.RedisCacheProvider;

@Configuration
public class CacheConfig {

    @Bean
    @Primary
    @ConditionalOnMissingBean
    public CacheProvider<DataSet> defaultCacheProvider(
            @Value("${bi.cache.type:memory}") String cacheType,
            @Value("${bi.cache.expire-minutes:5}") int expireMinutes,
            @Value("${bi.cache.max-size:1000}") int maxSize,
            RedisTemplate<String, Object> redisTemplate
    ) {
        return cacheType.equalsIgnoreCase("redis") ?
                new RedisCacheProvider<>(redisTemplate, expireMinutes) :
                new MemoryCacheProvider(expireMinutes, maxSize);
    }
}