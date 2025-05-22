package top.fusb.voyagebi.service;

import top.fusb.voyagebi.domain.DataSheetExtraInfo;
import top.fusb.voyagebi.persist.entity.DataSheetColumn;

import java.util.List;
import java.util.Map;

public interface DataSheetService {

    List<DataSheetColumn> getColumns(Long dataSheetId);

    Map<Long, DataSheetExtraInfo> getDataSheetExtraInfo(List<Long> dataSheetIds);
}
