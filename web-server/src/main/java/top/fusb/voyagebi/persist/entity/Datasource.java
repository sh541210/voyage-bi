package top.fusb.voyagebi.persist.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.example.server.mybatis.LogicalIdEntity;
import top.fusb.bi.data.base.domin.DatasourceType;
import top.fusb.voyagebi.domain.DatasourceCfgStore;

/**
 * 数据源实体类，表示一个数据源的信息。
 * 包括数据源的名称、配置、类型和描述等信息。
 * 支持根据环境获取数据源配置。
 */
@EqualsAndHashCode(callSuper = true)
@Data
@TableName(value = "bi_datasource", autoResultMap = true)
public class Datasource extends LogicalIdEntity<Datasource> {

    /** 数据源名称 */
    private String name;

    /** 存储数据源配置的对象 */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private DatasourceCfgStore cfgStore;

    /** 数据源类型，如 MySQL、PostgreSQL 等 */
    private DatasourceType type;

    /** 数据源的描述信息 */
    private String description;
}