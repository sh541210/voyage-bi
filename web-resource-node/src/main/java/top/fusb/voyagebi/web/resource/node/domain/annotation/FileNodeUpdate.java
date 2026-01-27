package top.fusb.voyagebi.web.resource.node.domain.annotation;

import top.fusb.voyagebi.web.resource.node.domain.BizType;
import top.fusb.voyagebi.web.resource.node.domain.RequestType;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface FileNodeUpdate {
    String bizRefIdName() default "id";

    RequestType requestType() default RequestType.BODY;

    BizType bizType();
}
