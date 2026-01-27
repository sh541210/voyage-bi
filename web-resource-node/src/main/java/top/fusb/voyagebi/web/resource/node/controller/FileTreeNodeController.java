package top.fusb.voyagebi.web.resource.node.controller;

import lombok.RequiredArgsConstructor;
import org.example.server.web.annotation.ResultController;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import top.fusb.voyagebi.web.resource.node.domain.FileTreeNodeForm;
import top.fusb.voyagebi.web.resource.node.domain.FileTreeNodeVO;
import top.fusb.voyagebi.web.resource.node.domain.RequestType;
import top.fusb.voyagebi.web.resource.node.domain.annotation.LockCheck;
import top.fusb.voyagebi.web.resource.node.service.IFileTreeNodeService;

import java.util.List;


/**
 * 文件树节点控制器，提供对文件树节点的增删改查操作
 */
@ResultController("api/file-tree-node")
@RequiredArgsConstructor
public class FileTreeNodeController {
    private final IFileTreeNodeService fileTreeNodeService;

    /**
     * 获取指定业务类型的文件树节点列表
     *
     * @param bizType 业务类型
     * @return 文件树节点列表
     */
    @GetMapping("/list")
    public List<FileTreeNodeVO> treeNodes(@RequestParam("bizType") String bizType) {
        return fileTreeNodeService.getNodeTree(bizType);
    }

    /**
     * 获取指定业务类型的文件夹节点列表
     *
     * @param bizType 业务类型
     * @return 文件夹节点列表
     */
    @GetMapping("/folder/list")
    public List<FileTreeNodeVO> folderTreeNodes(@RequestParam("bizType") String bizType) {
        return fileTreeNodeService.getFolderTreeNodes(bizType);
    }

    /**
     * 创建业务类型的文件树节点
     *
     * @param form 文件树节点表单数据
     * @return 创建后的文件树节点
     */
    @PostMapping("file")
    @LockCheck(idName = "pid")
    public FileTreeNodeVO createBizNode(@Validated @RequestBody FileTreeNodeForm form) {
        return fileTreeNodeService.createBizNode(form);
    }

    /**
     * 删除文件树节点
     *
     * @param id 文件树节点ID
     */
    @DeleteMapping
    @LockCheck(requestType = RequestType.PARAMS)
    public void removeNode(@RequestParam("id") Long id) {
        fileTreeNodeService.removeNode(id);
    }

    /**
     * 编辑文件树节点
     *
     * @param form 文件树节点表单数据
     */
    @PutMapping
    @LockCheck
    public void edit(@Validated @RequestBody FileTreeNodeForm form) {
        fileTreeNodeService.edit(form);
    }

    /**
     * 创建文件夹节点
     *
     * @param form 文件树节点表单数据
     * @return 创建后的文件夹节点
     */
    @PostMapping("folder")
    @LockCheck(idName = "pid")
    public FileTreeNodeVO createNode(@RequestBody FileTreeNodeForm form) {
        return fileTreeNodeService.createFolder(form);
    }

    /**
     * 根据ID获取文件树节点
     *
     * @param id 文件树节点ID
     * @return 文件树节点信息
     */
    @GetMapping()
    public FileTreeNodeVO get(@RequestParam("id") Long id) {
        return fileTreeNodeService.get(id);
    }

    /**
     * 加锁/解锁
     *
     * @param id
     * @param locked
     */
    @PostMapping("lock/{id}/{locked}")
    public void lock(@PathVariable("id") Long id, @PathVariable("locked") Boolean locked) {
        fileTreeNodeService.lock(id, locked);
    }
}
