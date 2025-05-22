package top.fusb.voyagebi.client.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import java.io.Serializable;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Data
public class DataResult implements Serializable {
    private boolean success;
    private String message;
    private DataSet data;

    @Data
    public static class DataSet implements Serializable {
        private List<String> columns;
        private List<List<Object>> rows;
        private Long total;

        private List<String> x;
        private List<String> y;
    }
    @JsonIgnore
    private DataSet getDataWithThrow() {
        if(!success) {
            throw new RuntimeException(message);
        }
        return data;
    }
    public List<Map<String,Object>> toMapList() {
        DataSet data = getDataWithThrow();
        List<String> columns = data.getColumns();
        return data.getRows().stream().map(list-> {
            Map<String,Object> object = new LinkedHashMap<>();
            for(int i = 0; i< columns.size(); i++) {
                object.put(columns.get(i),list.get(i));
            }
            return object;
        }).toList();
    }
}