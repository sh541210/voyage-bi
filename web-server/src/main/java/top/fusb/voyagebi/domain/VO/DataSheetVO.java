package top.fusb.voyagebi.domain.VO;

import lombok.Data;
import top.fusb.voyagebi.domain.DataSheetCfg;
import top.fusb.voyagebi.domain.enums.SheetType;

import java.io.Serializable;
import java.util.Set;

/**
 * 数据表视图对象
 */
@Data
public class DataSheetVO implements Serializable {
    /** 数据表ID */
    private Long id;
    /** 数据表名称 */
    private String name;
    /** 数据表类型 */
    private SheetType sheetType;
    /** 数据表SQL文本 */
    private String sqlText;
    /** 数据源ID */
    private Long datasourceId;
    /** 数据表名称 */
    private String tableName;
    /** 数据表更新时间 */
    private Long dataUpdateTime;
    /** 数据表中使用的变量名集合 */
    private Set<String> variableNames;
    /** 数据表配置项 */
    private DataSheetCfg cfg;

    /**
     * 获取数据表类型名称
     *
     * @return 数据表类型名称
     */
    public String getType() {
        return sheetType.getName();
    }
}