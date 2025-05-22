package top.fusb.voyagebi.domain.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serializable;

/**
 * 仪表盘分享创建/编辑表单
 */
@Data
public class DashboardShareForm implements Serializable {
    /** 仪表盘ID */
    @NotNull
    private Long dashboardId;
    /** 主题ID */
    @NotNull(message = "没有选择主题")
    private Long themeId;
    /** 名称 */
    @NotEmpty()
    @Size(max = 20)
    private String name;
    private String description;
    /** KEY */
    private String key;
    /** 是否加密 */
    private boolean encrypt;
}
