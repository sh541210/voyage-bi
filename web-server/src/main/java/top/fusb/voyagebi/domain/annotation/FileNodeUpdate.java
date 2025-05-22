package top.fusb.voyagebi.domain.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface FileNodeUpdate {
    String bizRefIdName() default "id";

    RequestType requestType() default RequestType.BODY;

    String bizType();
    
    enum RequestType {
        BODY, PARAMS
    }
}
