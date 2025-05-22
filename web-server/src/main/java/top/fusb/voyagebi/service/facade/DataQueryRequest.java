package top.fusb.voyagebi.service.facade;

import lombok.Builder;
import lombok.Data;
import org.apache.commons.codec.digest.DigestUtils;
import top.fusb.voyagebi.domain.Pagination;
import top.fusb.voyagebi.domain.VO.DataResult;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;
import java.util.function.Consumer;

@Data
@Builder
public class DataQueryRequest implements Serializable {
    private Long datasourceId;
    private String sqlText;
    private Pagination pagination;
    private Integer limit;
    @Builder.Default
    private boolean calcTotal = false;
    @Builder.Default
    private Map<String, Object> variables = new HashMap<>();
    private boolean forceRefresh;
    private String env;
    @Builder.Default
    private boolean countSql = false;
    private Consumer<DataResult> dataResultConsumer;
    private String requestId;
    @Builder.Default
    private boolean clearMetadata = true;
    private Long dataSheetId;

    public String generateCacheKey() {
        Map<String, Object> sortedVars = new TreeMap<>(getVariables());
        String keyBuilder = datasourceId +
                "|" + getFinalSql().trim() + // 去除SQL头尾空格
                "|" + sortedVars +  // TreeMap已排序
                "|" + env +
                "|" + countSql;
        return DigestUtils.sha256Hex(keyBuilder);
    }

    public String getFinalSql() {
        if (pagination != null) {
            return sqlText + " " + pagination;
        } else if (limit != null) {
            // SelectDB 如果嵌套查询里不指定limit，会出现排序失效问题，导致返回结果随机
            return String.format("SELECT * FROM (%s LIMIT %s) TMP LIMIT %s ", sqlText, limit, limit);
        }
        return sqlText;
    }

    public boolean isCalcTotal() {
        return calcTotal || (pagination != null && pagination.getPageNum() == 1);
    }
}
