package top.fusb.voyagebi.domain.VO;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import top.fusb.bi.data.base.domin.QueryDataSet;

import java.io.Serializable;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
public class DataSet extends QueryDataSet implements Serializable {
    private Long total;
    private List<String> x;
    private List<String> y;
    private boolean hitCache;
    private Long datasourceId;
    private Long datasheetId;
    private String env;

    public DataSet hitCache() {
        hitCache = true;
        return this;
    }

    public static DataSet ofQuery(QueryDataSet queryDataSet) {
        DataSet dataSet = new DataSet(queryDataSet.getColumns(), queryDataSet.getRows(), null);
        dataSet.setMetadata(queryDataSet.getMetadata());
        return dataSet;
    }

    public static DataSet ofEmpty() {
        return new DataSet(List.of(), List.of(), 0L);
    }

    @JsonIgnore
    public List<Object> getOneList() {
        return getRows().stream()
                .map(i -> i.isEmpty() ? null : i.get(0)).toList();
    }

    @JsonIgnore
    public Object getOne() {
        List<Object> oneList = getOneList();
        return oneList.isEmpty() ? null : oneList.get(0);
    }

    public DataSet(List<String> columns, List<List<Object>> rows, Long total) {
        super(columns, rows);
        this.total = total;
    }

    public void setXY(Integer xSize, Integer ySize) {
        List<String> columns = getColumns();
        x = columns.subList(0, xSize);
        y = columns.subList(xSize, Math.min(ySize + xSize, columns.size()));
    }
}
