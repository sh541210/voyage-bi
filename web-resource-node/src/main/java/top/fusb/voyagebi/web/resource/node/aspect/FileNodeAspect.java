package top.fusb.voyagebi.web.resource.node.aspect;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.example.server.web.ErrorCode;
import org.example.server.web.exception.BizException;
import org.example.server.web.utils.LoginUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.servlet.HandlerMapping;
import top.fusb.voyagebi.base.domain.utils.ReflectUtils;
import top.fusb.voyagebi.web.resource.node.domain.BizType;
import top.fusb.voyagebi.web.resource.node.domain.RequestType;
import top.fusb.voyagebi.web.resource.node.domain.annotation.FileNodeUpdate;
import top.fusb.voyagebi.web.resource.node.domain.annotation.LockCheck;
import top.fusb.voyagebi.web.resource.node.persist.FileTreeNode;
import top.fusb.voyagebi.web.resource.node.persist.mapper.FileTreeNodeMapper;

import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.util.Map;
import java.util.Optional;

/**
 * 资源节点切面
 */
@Component
@RequiredArgsConstructor
@Aspect
@Slf4j
public class FileNodeAspect {
    private final FileTreeNodeMapper mapper;

    /**
     * 根据请求类型从方法参数中解析 id
     */
    private Object resolveId(MethodSignature signature,
                             Object[] args,
                             RequestType requestType,
                             String idName) {
        Method method = signature.getMethod();
        if (requestType == RequestType.BODY) {
            // BODY 场景：默认取第一个参数作为请求体
            Object body = args[0];
            return ReflectUtils.getFieldValue(args[0], idName);
        }
        // PARAMS：通过 @RequestParam(name/value) 匹配
        if (requestType == RequestType.PARAMS) {
            Annotation[][] paramAnnotations = method.getParameterAnnotations();
            for (int i = 0; i < paramAnnotations.length; i++) {
                for (Annotation annotation : paramAnnotations[i]) {
                    if (annotation instanceof org.springframework.web.bind.annotation.RequestParam rp) {
                        String name = !rp.name().isEmpty() ? rp.name() : rp.value();
                        if (idName.equals(name)) {
                            return args[i];
                        }
                    }
                }
            }
        } else if (requestType == RequestType.PATH_VARIABLES) {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                Map<String, String> pathVars = (Map<String, String>) request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);
                if (pathVars != null && pathVars.containsKey(idName)) {
                    return pathVars.get(idName);
                }
            }
        }

        return null;
    }

    /**
     * 资源节点加锁校验
     */
    @Before("@annotation(top.fusb.voyagebi.web.resource.node.domain.annotation.LockCheck)")
    public void lockCheckBefore(org.aspectj.lang.JoinPoint joinPoint) {
        Object id = null;
        LockCheck.CheckType checkType = null;
        try {
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();
            Object[] args = joinPoint.getArgs();
            LockCheck annotation = method.getAnnotation(LockCheck.class);
            String idName = annotation.idName();
            RequestType requestType = annotation.requestType();
            checkType = annotation.checkType();
            id = resolveId(signature, args, requestType, idName);
        } catch (Exception e) {
            log.warn("Lock check resolveId error", e);
//            throw new RuntimeException("ee", e);
        }
        if (id != null && checkType != null) {
            FileTreeNode treeNode = getTreeNode(Long.valueOf(id.toString()), checkType);
            if (treeNode != null && treeNode.getLocked()) {
                throw new BizException(ErrorCode.define("操作失败," + BizType.fromCode(treeNode.getBizType()).getDesc()
                        + (treeNode.isDic() ? "文件夹" : "")
                        + "已被锁定"));
            }
        }
    }

    public FileTreeNode getTreeNode(Long id, LockCheck.CheckType checkType) {
        boolean fileNode = checkType.equals(LockCheck.CheckType.FileNode);
        return mapper.selectOne(i -> i.select(FileTreeNode::getLocked, FileTreeNode::getBizType, FileTreeNode::getBizRefId)
                .eq(fileNode, FileTreeNode::getId, id)
                .eq(!fileNode, FileTreeNode::getBizRefId, id)
                .eq(!fileNode, FileTreeNode::getBizType,
                        Optional.ofNullable(checkType.getBizType()).map(BizType::getCode).orElse(null))
                .ne(FileTreeNode::getCreateBy, LoginUtils.getUserId()));
    }

    /**
     * 同步更新逻辑
     *
     * @param joinPoint
     * @return
     * @throws Throwable
     */
    @Around("@annotation(top.fusb.voyagebi.domain.annotation.FileNodeUpdate)")
    public Object fileNodeUpdateMethodAround(ProceedingJoinPoint joinPoint) throws Throwable {
        Object bizRefId = null;
        BizType bizType = null;
        try {
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();
            Object[] args = joinPoint.getArgs();
            FileNodeUpdate annotation = method.getAnnotation(FileNodeUpdate.class);
            bizType = annotation.bizType();
            RequestType requestType = annotation.requestType();
            String bizRefIdName = annotation.bizRefIdName();
            bizRefId = resolveId(signature, args, requestType, bizRefIdName);
        } catch (Exception e) {
            log.warn("Get biz ref id error", e);
        }
        Object result = joinPoint.proceed(); // 执行方法
        if (bizRefId != null) {
            mapper.updateTime(bizRefId, bizType.name());
        }
        return result;
    }
}
