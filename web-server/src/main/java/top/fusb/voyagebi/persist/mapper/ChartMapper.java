package top.fusb.voyagebi.persist.mapper;


import org.example.server.mybatis.BaseMapper;
import top.fusb.voyagebi.persist.entity.Chart;
import top.fusb.voyagebi.utils.CacheManager;

import java.time.Duration;

public interface ChartMapper extends BaseMapper<Chart> {
    CacheManager<Chart> manager = new CacheManager<>(Duration.ofSeconds(10));

    default Chart getById(Long id) {
        return manager.get(id.toString(), i-> selectById(id));
    }
}
