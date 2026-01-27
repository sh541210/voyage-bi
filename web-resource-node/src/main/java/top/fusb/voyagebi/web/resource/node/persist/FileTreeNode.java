package top.fusb.voyagebi.web.resource.node.persist;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.example.server.mybatis.BaseEntity;

/**
 * 文件树节点实体类，表示文件树中的一个节点。
 * 包含节点的基本信息，如名称、父节点ID、业务引用ID、工作空间ID等。
 */
@EqualsAndHashCode(callSuper = true)
@Data
@TableName("bi_file_tree_node")
public class FileTreeNode extends BaseEntity<FileTreeNode> {

    /** 文件树节点名称 */
    private String name;

    /** 文件树父节点ID */
    private Long pid;

    /** 文件树业务引用ID */
    private Long bizRefId;

    /** 文件树业务类型 */
    private String bizType;

    /** 文件树业务类型扩展字段 */
    private String bizTypeExtra;

    /** 文件树节点的描述 */
    private String description;

    /** 工作空间ID */
    private Long workspaceId;

    /** 是否加锁 */
    private Boolean locked;

    /** 加锁用户ID */
    private String lockUserId;

    /** 加锁时间 */
    private Long lockTime;

    public boolean isDic() {
        return bizRefId == 0;
    }
}