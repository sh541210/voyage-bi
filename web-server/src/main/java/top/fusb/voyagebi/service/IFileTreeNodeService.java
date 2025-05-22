package top.fusb.voyagebi.service;

import org.springframework.transaction.annotation.Transactional;
import top.fusb.voyagebi.domain.request.FileTreeNodeForm;
import top.fusb.voyagebi.domain.request.FileTreeNodeVO;

import java.util.List;

public interface IFileTreeNodeService {

    List<FileTreeNodeVO> getNodesByCreateBy(Long createBy);

    List<FileTreeNodeVO> getNodeTree(String bizType);

    FileTreeNodeVO createFolder(FileTreeNodeForm form);

    @Transactional(rollbackFor = Exception.class)
    void edit(FileTreeNodeForm form);

    FileTreeNodeVO get(Long id);

    List<FileTreeNodeVO> getFolderTreeNodes(String bizType);

    FileTreeNodeVO createBizNode(FileTreeNodeForm form);

    void removeNode(Long id);
}
