package top.fusb.voyagebi.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import java.io.Serializable;

@Data
public class CacheCfg implements Serializable {
    private static final int DEFAULT_TTL = 1800; // 30分钟
    private static final int TOLERANCE = 120;   // 2分钟
    private static final int MIN_TTL = 60;      // 1分钟
    private static final int MAX_TTL = 10800;    // 3小时

    private boolean forceRefresh = false;
    private int defaultTTL = DEFAULT_TTL;
    private int tolerance = TOLERANCE;
    private int minTTL = MIN_TTL;
    private int maxTTL = MAX_TTL;

    public int getDefaultTTL() {
        if (forceRefresh) {
            return 60;
        }
        return defaultTTL;
    }

    @JsonIgnore
    public long getToleranceMills() {
        return TOLERANCE * 1000L;
    }
}
