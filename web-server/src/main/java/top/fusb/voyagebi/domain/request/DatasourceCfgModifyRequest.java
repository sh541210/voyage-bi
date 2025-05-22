package top.fusb.voyagebi.domain.request;

import lombok.Data;
import lombok.EqualsAndHashCode;
import top.fusb.voyagebi.domain.DatasourceCfg;

import java.io.Serializable;

@EqualsAndHashCode(callSuper = true)
@Data
public class DatasourceCfgModifyRequest extends DatasourceCfg implements Serializable {
    private Long id;
    private String env;
}
