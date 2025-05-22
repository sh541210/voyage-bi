package top.fusb.voyagebi.persist.mapper;

import org.example.server.mybatis.BaseMapper;
import top.fusb.voyagebi.persist.entity.FileTreeNode;

public interface FileTreeNodeMapper extends BaseMapper<FileTreeNode> {

    default void updateTime(Object refId, String bizType) {
        updateBy(i -> i.eq(FileTreeNode::getBizRefId, refId)
                .eq(FileTreeNode::getBizType, bizType)
                .set(FileTreeNode::getUpdateTime, System.currentTimeMillis()));
    }
}
