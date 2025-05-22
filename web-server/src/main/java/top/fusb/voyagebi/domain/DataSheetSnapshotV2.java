package top.fusb.voyagebi.domain;

import lombok.Data;

import java.io.Serializable;

@Data
public class DataSheetSnapshotV2 implements Serializable {
    private String sqlText;
    private DataSheetCfg dataSheetCfg = new DataSheetCfg();
    private String datasourceEnv;
}
