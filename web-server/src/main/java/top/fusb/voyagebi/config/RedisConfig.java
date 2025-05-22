package top.fusb.voyagebi.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {
    @Value("${spring.profiles.active}")
    private String activeProfile;

    static class PrefixKeySerializer extends StringRedisSerializer {
        private final String prefix;

        public PrefixKeySerializer(String prefix) {
            this.prefix = prefix;
        }

        @Override
        public byte[] serialize(String key) {
            return super.serialize(prefix + ":" + key);
        }
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        PrefixKeySerializer keySerializer = new PrefixKeySerializer(activeProfile);
        // 设置Key的序列化方式（String类型）
        template.setKeySerializer(keySerializer);
        template.setHashKeySerializer(keySerializer);
        template.afterPropertiesSet();
        return template;
    }
}