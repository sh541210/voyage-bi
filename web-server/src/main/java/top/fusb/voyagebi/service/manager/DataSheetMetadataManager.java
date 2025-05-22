package top.fusb.voyagebi.service.manager;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.time.DateFormatUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import top.fusb.bi.data.base.client.DataClient;
import top.fusb.voyagebi.domain.CacheCfg;
import top.fusb.voyagebi.domain.DataSheetCfg;
import top.fusb.voyagebi.domain.VO.DataSet;
import top.fusb.voyagebi.persist.entity.DataSheet;
import top.fusb.voyagebi.persist.mapper.DataSheetMapper;
import top.fusb.voyagebi.service.cache.CacheProvider;

import java.time.Duration;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.stream.IntStream;

@RequiredArgsConstructor
@Component
@Slf4j
public class DataSheetMetadataManager {
    private final DataSheetMapper dataSheetMapper;
    private final DataClientManager dataClientManager;
    private final RedisTemplate<String, Object> redisTemplate;
    private final CacheProvider<DataSet> cacheProvider;

    @Value("${bi.sync.update_time.period:120}")
    private int syncUpdateTimeMinutes;
    @Value("${bi.sync.update_time.delay:60}")
    private int syncUpdateTimeDelayMinutes;

    private final Map<Long, DataSheetCfg> cfgMap = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        Executors.newSingleThreadScheduledExecutor().scheduleAtFixedRate(this::recordUpdateTimes,
                syncUpdateTimeDelayMinutes, syncUpdateTimeMinutes, TimeUnit.SECONDS);
    }

    private DataSheetCfg getDataSheetCfg(Long dataSheetId) {
        return cfgMap.computeIfAbsent(dataSheetId,
                i -> dataSheetMapper.selectValueById(DataSheet::getCfg, dataSheetId));
    }

    private void recordUpdateTimes() {
        List<DataSheet> dataSheets = dataSheetMapper.selectList(i -> i
                        .select(DataSheet::getSqlText, DataSheet::getName,
                                DataSheet::getCfg,
                                DataSheet::getDatasourceId, DataSheet::getId))
                .stream().filter(i -> StringUtils.isNotEmpty(i.getSqlText())).toList();
        dataSheets.forEach(i -> cfgMap.put(i.getId(), i.getCfg()));
        for (DataSheet dataSheet : dataSheets) {
            try {
                Long datasourceId = dataSheet.getDatasourceId();
                DataClient client = dataClientManager.getDataClient(datasourceId, null);
                Long dataUpdateTime = client.getDataUpdateTime(dataSheet.getSqlText());
                if (dataUpdateTime != null) {
                    log.info("{}「{}」更新时间:{}", dataSheet.getName(), dataSheet.getId(),
                            DateFormatUtils.format(dataUpdateTime, "yyyy-MM-dd HH:mm:ss"));
                    dataSheetMapper.updateBy(i -> i.eq(DataSheet::getId, dataSheet.getId())
                            .set(DataSheet::getDataUpdateTime, dataUpdateTime));
                    recordUpdateTime(dataSheet.getId(), dataUpdateTime);
                }
            } catch (Exception ex) {
                log.warn("异常", ex);
            }
        }
    }

    private void recordUpdateTime(Long dataSheetId, Long updateTime) {
        String key = getKey(dataSheetId);
        redisTemplate.opsForZSet().add(key, updateTime, updateTime);
        redisTemplate.opsForZSet().removeRange(key, 0, -101);
    }

    private String getKey(Long dataSheetId) {
        return "data-sheet:data_update_time:" + dataSheetId;
    }

    public boolean isForceRefresh(String cacheKey, Long dataSheetId) {
        Long keyCreateTime = cacheProvider.getCreateTime(cacheKey);
        DataSheetCfg cfg = getDataSheetCfg(dataSheetId);
        CacheCfg cacheCfg = cfg.getCacheCfg();
        if (cacheCfg.isForceRefresh()) {
            return true;
        }
        if (keyCreateTime != null) {
            List<Long> history = getHistory(dataSheetId, 2);
            if (!history.isEmpty() && history.get(0) > keyCreateTime) {
                if (history.get(0) - keyCreateTime > cacheCfg.getToleranceMills()) {
                    log.info("{} {} 过期{}s", cacheKey, dataSheetId, history.get(0) - keyCreateTime);
                    return true;
                }
                if (history.size() > 1) {
                    log.info("{} {} 过期{}s", cacheKey, dataSheetId, history.get(0) - history.get(1));
                    return (history.get(0) - history.get(1)) > cacheCfg.getToleranceMills();
                }
                return true;
            }
        }
        return false;
    }

    public Duration getDynamicTTLDuration(Long dataSheetId) {
        if (dataSheetId == null) {
            return Duration.ofSeconds(30);
        }
        DataSheetCfg cfg = getDataSheetCfg(dataSheetId);
        int dynamicTTL = calcDynamicTTL(cfg.getCacheCfg(), getHistory(dataSheetId, 10));
        log.info("ttl:{}, sheetId: {}", dynamicTTL, dataSheetId);
        return Duration.ofSeconds(dynamicTTL);
    }

    public int calcDynamicTTL(CacheCfg cacheCfg, List<Long> timestamps) {
        List<Long> intervals = IntStream.range(0, timestamps.size() - 1)
                .mapToObj(i -> (timestamps.get(i) - timestamps.get(i + 1)) / 1000)
                .toList();
        if (intervals.size() < 3) {
            return cacheCfg.getDefaultTTL();
        }

        double predicted = intervals.get(0);
        double alpha = 0.95;
        for (int i = 1; i < intervals.size(); i++) {
            predicted = alpha * intervals.get(i) + (1 - alpha) * predicted;
            alpha *= 0.95;
        }

        long currentTime = System.currentTimeMillis();
        long lastUpdate = timestamps.isEmpty() ? 0 : timestamps.get(0);
        long elapsed = (currentTime - lastUpdate) / 1000;
        long remaining = (int) Math.max((long) predicted - elapsed, 0);
        int ttl = (int) remaining;
        return Math.min(Math.max(ttl, cacheCfg.getMinTTL()), cacheCfg.getMaxTTL());
    }

    public List<Long> getHistory(Long dataSheetId, int last) {
        return Optional.ofNullable(redisTemplate.opsForZSet()
                        .reverseRange(getKey(dataSheetId), 0, last - 1)).orElse(new HashSet<>())
                .stream().map(i -> Long.parseLong(i.toString()))
                .sorted((o1, o2) -> (int) (o2 - o1)).toList();
    }
}
