package top.fusb.voyagebi.service.aspect;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import top.fusb.voyagebi.domain.annotation.FileNodeUpdate;
import top.fusb.voyagebi.persist.mapper.FileTreeNodeMapper;
import top.fusb.voyagebi.utils.ReflectUtils;

import java.lang.reflect.Method;

@Component
@RequiredArgsConstructor
@Aspect
@Slf4j
public class FileNodeUpdateAspect {
    private final FileTreeNodeMapper mapper;

    @Around("@annotation(top.fusb.voyagebi.domain.annotation.FileNodeUpdate)")
    public Object fileNodeUpdateMethodAround(ProceedingJoinPoint joinPoint) throws Throwable {
        Object bizRefId = null;
        String bizType = null;
        try {
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();
            Object[] args = joinPoint.getArgs();
            FileNodeUpdate annotation = method.getAnnotation(FileNodeUpdate.class);
            bizType = annotation.bizType();
            FileNodeUpdate.RequestType requestType = annotation.requestType();
            String bizRefIdName = annotation.bizRefIdName();
            String[] paramNames = signature.getParameterNames();
            if (requestType == FileNodeUpdate.RequestType.BODY) {
                Object body = args[0];
                bizRefId = ReflectUtils.getFieldValue(body, bizRefIdName);
            } else if (requestType == FileNodeUpdate.RequestType.PARAMS) {
                // 遍历参数名找到匹配的
                for (int i = 0; i < paramNames.length; i++) {
                    if (bizRefIdName.equals(paramNames[i])) {
                        bizRefId = args[i];
                        break;
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Get biz ref id error", e);
        }
        Object result = joinPoint.proceed(); // 执行方法
        if (bizRefId != null) {
            // 调用mapper更新
            mapper.updateTime(bizRefId, bizType);
        }
        return result;
    }
}
