package top.fusb.voyagebi.web.resource.node.domain.annotation;

import lombok.Getter;
import top.fusb.voyagebi.web.resource.node.domain.BizType;
import top.fusb.voyagebi.web.resource.node.domain.RequestType;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface LockCheck {
    String idName() default "id";

    RequestType requestType() default RequestType.BODY;

    CheckType checkType() default CheckType.FileNode;

    enum CheckType {
        FileNode(),
        dashboard(BizType.DASHBOARD),
        dataSheet(BizType.DATA_SHEET),
        datasource(BizType.DATASOURCE);
        @Getter
        private BizType bizType;

        CheckType() {
        }

        CheckType(BizType bizType) {
            this.bizType = bizType;
        }
    }
}
