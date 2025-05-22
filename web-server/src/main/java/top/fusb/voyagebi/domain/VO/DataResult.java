package top.fusb.voyagebi.domain.VO;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import top.fusb.bi.data.base.domin.QueryDataSet;

import java.io.Serializable;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ExecutionException;

@Data
public class DataResult implements Serializable {
    private DataSet data;
    private boolean success;
    private String message;

    public static DataResult failed(Throwable ex) {
        if (ex instanceof ExecutionException || ex instanceof CompletionException) return failed(ex.getCause());
        DataResult result = new DataResult();
        result.setSuccess(false);
        result.setData(DataSet.ofEmpty());
        result.setMessage(ex.getMessage());
        return result;
    }

    public static DataResult empty() {
        return DataResult.success(DataSet.ofEmpty());
    }

    public static DataResult success(DataSet data) {
        DataResult result = new DataResult();
        result.setSuccess(true);
        result.setData(data);
        result.setMessage("");
        return result;
    }

    @JsonIgnore
    private QueryDataSet getDataWithThrow() {
        if (!success) throw new RuntimeException(message);
        return data;
    }

    public List<Map<String, Object>> toMapList() {
        QueryDataSet data = getDataWithThrow();
        List<String> columns = data.getColumns();
        return data.getRows().stream().map(list -> {
            Map<String, Object> object = new LinkedHashMap<>();
            for (int i = 0; i < columns.size(); i++) object.put(columns.get(i), list.get(i));
            return object;
        }).toList();
    }
}
