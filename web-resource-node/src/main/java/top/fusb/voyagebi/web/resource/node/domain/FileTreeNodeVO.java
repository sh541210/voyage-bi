package top.fusb.voyagebi.web.resource.node.domain;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.example.server.user.utils.UserUtils;
import org.example.server.web.utils.LoginUtils;
import top.fusb.voyagebi.base.domain.VO.BaseVO;

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
    /** 是否加锁 */
    private Boolean locked;
    /** 加锁用户ID */
    private String lockUserId;
    /** 加锁时间 */
    private Long lockTime;


    public boolean isUnLockable() {
        return getLockUserId() != null && getLockUserId().equals(LoginUtils.getUserId().toString());
    }

    public boolean isLockable() {
        return getCreateBy().equals(LoginUtils.getUserId().toString());
    }

    public String getLockUserName() {
        return UserUtils.getNickname(lockUserId);
    }
}
