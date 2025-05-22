package top.fusb.voyagebi.domain.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.validator.constraints.Length;

import java.io.Serializable;
import java.util.Map;

/**
 * 文件树表单
 */
@Data
public class FileTreeNodeForm implements Serializable {
    /** ID */
    private Long id;
    /** 文件树节点名称 */
    @NotEmpty
    @Length(max = 64, min = 2)
    private String name;
    /** 文件树父节点ID */
    private Long pid = 0L;
    /** 文件树业务类型 */
    @NotNull
    private String bizType;
    /** 文件树业务二级业务类型 */
    private String bizTypeExtra;
    /** 描述 */
    @NotNull
    @Length(max = 128)
    private String description;
    /** 额外字段 */
    private Map<String, Object> extraFields;
}
