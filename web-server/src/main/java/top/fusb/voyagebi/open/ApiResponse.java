package top.fusb.voyagebi.open;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * 响应
 */
@Data
public class ApiResponse implements Serializable {
    /** 数据列 **/
    private List<String> columns;
    /** 数据 **/
    private List<List<Object>> rows;
    /** 分页总数 **/
    private Long total;
    /** x轴列 **/
    private List<String> x;
    /** y轴列 **/
    private List<String> y;
}
