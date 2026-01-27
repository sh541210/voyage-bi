package top.fusb.voyagebi.web.resource.node.service;

import org.springframework.transaction.annotation.Transactional;
import top.fusb.voyagebi.web.resource.node.domain.FileTreeNodeForm;
import top.fusb.voyagebi.web.resource.node.domain.FileTreeNodeVO;

import java.util.List;

public interface IFileTreeNodeService {

    List<FileTreeNodeVO> getNodesByCreateBy();

    List<FileTreeNodeVO> getNodeTree(String bizType);

    FileTreeNodeVO createFolder(FileTreeNodeForm form);

    @Transactional(rollbackFor = Exception.class)
    void edit(FileTreeNodeForm form);

    FileTreeNodeVO get(Long id);

    List<FileTreeNodeVO> getFolderTreeNodes(String bizType);

    FileTreeNodeVO createBizNode(FileTreeNodeForm form);

    void removeNode(Long id);

    void lock(Long id, boolean locked);
}
