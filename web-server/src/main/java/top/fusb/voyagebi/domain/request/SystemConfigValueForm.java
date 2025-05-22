package top.fusb.voyagebi.domain.request;

import lombok.Data;

import java.io.Serializable;

/**
 * 系统配置表单
 */
@Data
public class SystemConfigValueForm implements Serializable {
    private String configKey;
    private Object value;
}
