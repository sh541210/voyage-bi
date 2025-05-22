package top.fusb.voyagebi.persist.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.example.server.mybatis.BaseEntity;

@EqualsAndHashCode(callSuper = true)
@Data
@TableName("bi_query_record")
public class QueryRecord extends BaseEntity<QueryRecord> {
    private Long startTime;
    private Long queryEndTime;
    private Long queryStartTime;
    private Boolean hitCache;
    private Long datasourceId;
    private String originSql;
    private Long chartId;
    private int state;
    private String message;
    private Long endTime;
    private Long submitTime;
    private String source;
    private Long dataSheetId;
    private String env;
}
