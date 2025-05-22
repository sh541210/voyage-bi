package top.fusb.voyagebi.persist.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.example.server.mybatis.LogicalIdEntity;
import top.fusb.voyagebi.domain.enums.SheetColumnDataType;
import top.fusb.voyagebi.domain.enums.SheetColumnType;
/**
 * 代表数据表列的实体，包含数据表列的基本信息，如名称、描述、数据类型等。
 * 用于管理数据表中每一列的属性和配置，帮助对数据表结构进行抽象和操作。
 */
@EqualsAndHashCode(callSuper = true)
@TableName("bi_data_sheet_column")
@Data
public class DataSheetColumn extends LogicalIdEntity<DataSheetColumn> {

    /** 数据表ID，关联到数据表 */
    private Long dataSheetId;

    /** 数据表列名称 */
    private String name;

    /** 数据表列的描述信息 */
    private String description;

    /**
     * 数据列原始类型(Java)
     */
    private String originType;

    /** 数据列的长度 */
    private Integer columnLength;

    /** 数据列在原始数据表中的名称 */
    private String originName;

    /** 数据列的注释 */
    private String comment;

    /** 数据列的数据类型 */
    private SheetColumnDataType dataType;

    /** 数据列在原始数据表中的数据类型 */
    private SheetColumnDataType originDataType;

    /** 数据列的类型（如：普通列、索引列等） */
    private SheetColumnType columnType;
}