package top.fusb.voyagebi.domain.request;

import lombok.Data;
import top.fusb.voyagebi.domain.DatasourceCfgStore;

import java.io.Serializable;

@Data
public class DatasourceForm implements Serializable {
    private Long id;
    private DatasourceCfgStore cfgStore;
}
