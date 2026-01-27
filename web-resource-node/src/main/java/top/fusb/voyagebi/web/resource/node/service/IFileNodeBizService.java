package top.fusb.voyagebi.web.resource.node.service;

import top.fusb.voyagebi.web.resource.node.persist.FileTreeNode;

import java.util.Map;

public interface IFileNodeBizService {
    void update(Long id, String name, String description);

    String bizName();

    void create(FileTreeNode node, Map<String, Object> extraFields);

    int deleteById(Long id);
}
