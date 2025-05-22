package top.fusb.voyagebi.domain.request;

import lombok.Data;
import lombok.EqualsAndHashCode;
import top.fusb.voyagebi.domain.VO.BaseVO;

import java.io.Serializable;

/**
 * 文件树节点视图
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class FileTreeNodeVO extends BaseVO implements Serializable {
    /** ID */
    private Long id;
    /** 文件树节点名称 */
    private String name;
    /** 文件树父节点ID */
    private Long pid;
    /** 文件树业务引用ID */
    private Long bizRefId;
    /** 文件树业务类型 */
    private String bizType;
    /** 文件树业务二级业务类型 */
    private String bizTypeExtra;
    /** 描述 */
    private String description;
}
