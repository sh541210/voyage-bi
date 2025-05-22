package top.fusb.voyagebi.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.server.web.ErrorCode;
import org.example.server.web.exception.BizException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import top.fusb.voyagebi.domain.request.FileTreeNodeForm;
import top.fusb.voyagebi.domain.request.FileTreeNodeVO;
import top.fusb.voyagebi.persist.entity.FileTreeNode;
import top.fusb.voyagebi.persist.mapper.FileTreeNodeMapper;
import top.fusb.voyagebi.service.IFileNodeBizService;
import top.fusb.voyagebi.service.IFileTreeNodeService;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Consumer;
import java.util.stream.Collectors;

import static org.example.server.web.utils.BeanUtils.*;

@Service
@RequiredArgsConstructor
public class FileTreeNodeServiceImpl implements IFileTreeNodeService {

    private final FileTreeNodeMapper mapper;
    private final List<IFileNodeBizService> updaters;

    @Override
    public List<FileTreeNodeVO> getNodesByCreateBy(Long createBy) {
        return listAToListB(mapper.selectList(
                i->i.eq(FileTreeNode::getCreateBy, createBy)
                        .ne(FileTreeNode::getBizRefId, 0)),FileTreeNodeVO.class);
    }

    @Override
    public List<FileTreeNodeVO> getNodeTree(String bizType) {
        return listAToListB(mapper.selectList(i -> i
                .eq(FileTreeNode::getBizType, bizType)
                .orderByAsc(FileTreeNode::getCreateTime)), FileTreeNodeVO.class);
    }

    @Override
    public FileTreeNodeVO createFolder(FileTreeNodeForm form) {
        FileTreeNode node = aToB(form, FileTreeNode.class);
        checkNameDuplicate(node);
        node.setBizRefId(0L);
        node.setId(null);
        return aToB(mapper.insertRt(node), FileTreeNodeVO.class);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void edit(FileTreeNodeForm form) {
        Long id = form.getId();
        FileTreeNode node = Optional.ofNullable(mapper.selectById(id)).orElseThrow(() -> new BizException(ErrorCode.define(-1, "没有找到节点")));
        checkNameDuplicate(node);
        Long bizRefId = mapper.selectValueById(FileTreeNode::getBizRefId, form.getId());
        if (bizRefId > 0 && ((form.getName() != null && !form.getName().equals(node.getName())) ||
                (form.getDescription() != null && !form.getDescription().equals(node.getDescription())))) {
            invoke(form.getBizType(), i -> i.update(bizRefId, form.getName(), form.getDescription()));
        }
        mapper.save(aToB(form, FileTreeNode.class));
    }

    private void invoke(String bizType, Consumer<IFileNodeBizService> consume) {
        Map<String, IFileNodeBizService> map = updaters.stream().collect(Collectors.toMap(IFileNodeBizService::bizName, i -> i));
        Optional.ofNullable(map.get(bizType)).ifPresent(consume);
    }

    @Override
    public FileTreeNodeVO get(Long id) {
        return aToB(mapper.selectById(id), FileTreeNodeVO.class);
    }

    @Override
    public List<FileTreeNodeVO> getFolderTreeNodes(String bizType) {
        return listAToListB(mapper.selectList(i -> i.eq(FileTreeNode::getBizRefId, 0)
                .eq(FileTreeNode::getBizType, bizType)), FileTreeNodeVO.class);
    }

    private void checkNameDuplicate(FileTreeNode node) {
        node.getId();
        long count = mapper.countBy(i -> i.eq(FileTreeNode::getName, node.getName())
                .eq(FileTreeNode::getPid, node.getPid())
                .eq(FileTreeNode::getBizType, node.getBizType())
                .ne(node.getId() != null, FileTreeNode::getId, node.getId()));
        if (count > 0) {
            throw new BizException(ErrorCode.define(-1, "名称%s重复"), node.getName());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public FileTreeNodeVO createBizNode(FileTreeNodeForm form) {
        FileTreeNode node = aToBIgnoreId(form, FileTreeNode.class);
        checkNameDuplicate(node);
        invoke(form.getBizType(), i -> i.create(node, form.getExtraFields()));
        node.setBizType(form.getBizType());
        node.setPid(form.getPid());
        return aToB(mapper.insertRt(node), FileTreeNodeVO.class);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void removeNode(Long id) {
        FileTreeNode node = mapper.selectById(id);
        if (node.getBizRefId() != null && node.getBizRefId() > 0) {
            invoke(node.getBizType(), i -> i.deleteById(node.getBizRefId()));
        } else {
            long count = mapper.countBy(i -> i.eq(FileTreeNode::getPid, id));
            if (count > 0) {
                throw new BizException(ErrorCode.define(-1, "清先删除文件夹" + node.getBizType()));
            }
        }
        mapper.deleteById(id);
    }
}
