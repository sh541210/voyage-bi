package top.fusb.voyagebi.persist.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.example.server.mybatis.LogicalIdEntity;
import top.fusb.bi.data.base.utils.SqlUtils;
import top.fusb.voyagebi.domain.DataSheetCfg;
import top.fusb.voyagebi.domain.enums.SheetType;

/**
 * 代表数据集实体，包含数据集的基本信息，如名称、类型、SQL语句、数据源等。
 * 用于管理和存储数据集的相关配置，支持自定义SQL查询和表格设置。
 */
@EqualsAndHashCode(callSuper = true)
@Data
@TableName(value = "bi_data_sheet", autoResultMap = true)
public class DataSheet extends LogicalIdEntity<DataSheet> {

    /**
     * 数据集名称
     */
    private String name;

    /**
     * 数据集类型，如：表、视图等
     */
    private SheetType sheetType;

    /**
     * 存储SQL查询文本，定义数据集获取数据的方式
     */
    private String sqlText;

    /**
     * 关联的数据源ID
     */
    private Long datasourceId;

    /**
     * 数据集对应的表名
     */
    private String tableName;

    /**
     * 数据集的更新时间
     */
    private Long dataUpdateTime;

    /**
     * 数据集描述信息
     */
    private String description;

    /**
     * 数据集的自定义配置
     */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private DataSheetCfg cfg;

    /**
     * 获取处理后的SQL文本，如果SQL末尾有分号，则去除
     */
    public String getSqlText() {
        return SqlUtils.removeSemicolon(sqlText);
    }
}