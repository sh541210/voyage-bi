package top.fusb.voyagebi.domain.VO;

import lombok.Data;
import top.fusb.voyagebi.domain.enums.SheetColumnDataType;
import top.fusb.voyagebi.domain.enums.SheetColumnType;

import java.io.Serializable;
import java.util.Optional;

/**
 * 数据表列视图对象
 */
@Data
public class DataSheetColumnVO implements Serializable {
    /** ID */
    private Long id;
    /** 数据表ID */
    private Long dataSheetId;
    /** 数据表列名称 */
    private String name;
    /** 描述 */
    private String description;
    /** 数据列原类型 */
    private String originType;
    /** 列长度 */
    private Integer columnLength;
    /** 原名称 */
    private String originName;
    /** 注释 */
    private String comment;
    /** 数据表列数据类型 */
    private SheetColumnDataType dataType;
    /** 原列数据类型 */
    private SheetColumnDataType originDataType;
    /** 列类型 */
    private SheetColumnType columnType;

    /**
     * 获取描述，如果描述为空，则返回注释，如果注释为空，则返回列名称
     *
     * @return 描述、注释或列名称
     */
    public String getDesc() {
        return Optional.ofNullable(Optional.ofNullable(description).orElse(comment))
                .orElse(name);
    }
}
