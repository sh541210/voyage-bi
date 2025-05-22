package top.fusb.voyagebi.domain.request;

import top.fusb.voyagebi.domain.enums.DashboardType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serializable;

/**
 * 仪表盘编辑表单
 */
@Data
public class DashboardEditForm implements Serializable {
    /** ID */
    private Long id;
    /** 名称 */
    @NotEmpty
    @Size(max = 20)
    private String name;
    /** 描述 */
    @Size(max = 120)
    private String description;
    /** 仪表盘类型 */
    @NotNull
    private DashboardType type;
    /** 应用ID */
    private Long appId;
}