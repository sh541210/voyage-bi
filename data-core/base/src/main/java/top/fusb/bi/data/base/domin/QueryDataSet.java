package top.fusb.bi.data.base.domin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QueryDataSet implements Serializable {
    private List<String> columns;
    private List<List<Object>> rows;
    private QueryMetadata metadata = new QueryMetadata();

    public QueryDataSet(List<String> columns, List<List<Object>> rows) {
        this.columns = columns;
        this.rows = rows;
    }

    @Data
    public static class QueryMetadata implements Serializable {
        private Long queryEndTime;
        private Long queryStartTime;
        private Long submitTime;
        private String originSql;
    }
}
