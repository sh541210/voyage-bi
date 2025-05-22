package top.fusb.voyagebi.persist.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.example.server.mybatis.BaseEntity;

@EqualsAndHashCode(callSuper = true)
@Data
@TableName("bi_system_config")
public class SystemConfig extends BaseEntity<SystemConfig> {
    /** 配置项名称，唯一 */
    private String configKey;

    /** 配置项值 */
    private String configValue;

    /** 配置项描述 */
    private String configDescription;

    /** 配置项数据类型，如 String, Integer, Boolean, JSON 等 */
    private String dataType;

    /** 是否启用，0 为禁用，1 为启用 */
    private Boolean enabled;
}
