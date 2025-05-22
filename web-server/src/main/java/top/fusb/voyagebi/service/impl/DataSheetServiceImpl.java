package top.fusb.voyagebi.service.impl;

import com.baomidou.mybatisplus.core.toolkit.CollectionUtils;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.server.mybatis.IdEntity;
import org.example.server.web.ErrorCode;
import org.example.server.web.exception.BizException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import top.fusb.bi.data.base.utils.DynamicBlocks;
import top.fusb.voyagebi.domain.DataSheetExtraInfo;
import top.fusb.voyagebi.domain.FileBizTypes;
import top.fusb.voyagebi.domain.VO.*;
import top.fusb.voyagebi.domain.annotation.FileNodeUpdate;
import top.fusb.voyagebi.domain.enums.SheetColumnDataType;
import top.fusb.voyagebi.domain.enums.SheetColumnType;
import top.fusb.voyagebi.domain.request.DataSheetColumnForm;
import top.fusb.voyagebi.domain.request.SheetDataGetParam;
import top.fusb.voyagebi.persist.entity.DataSheet;
import top.fusb.voyagebi.persist.entity.DataSheetColumn;
import top.fusb.voyagebi.persist.mapper.DataSheetColumnMapper;
import top.fusb.voyagebi.persist.mapper.DataSheetMapper;
import top.fusb.voyagebi.service.DataSheetService;
import top.fusb.voyagebi.service.facade.DataClientFacade;
import top.fusb.voyagebi.service.facade.DataQueryRequest;

import java.util.*;
import java.util.stream.Collectors;

import static org.example.server.web.utils.BeanUtils.aToB;
import static org.example.server.web.utils.BeanUtils.listAToListB;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataSheetServiceImpl implements DataSheetService {
    private final DataSheetColumnMapper dataSheetColumnMapper;
    private final DataSheetMapper dataSheetMapper;
    private final DataClientFacade dataClientFacade;

    public List<DataSheetColumn> getColumns(Long dataSheetId, Set<String> columnNames) {
        return dataSheetColumnMapper.selectList(i -> i
                .in(!CollectionUtils.isEmpty(columnNames), DataSheetColumn::getName, columnNames)
                .eq(DataSheetColumn::getDataSheetId, dataSheetId));
    }

    @Override
    public List<DataSheetColumn> getColumns(Long dataSheetId) {
        return dataSheetColumnMapper.selectList(i -> i
                .eq(DataSheetColumn::getDataSheetId, dataSheetId));
    }

    @Override
    public Map<Long, DataSheetExtraInfo> getDataSheetExtraInfo(List<Long> dataSheetIds) {
        if (dataSheetIds.isEmpty()) {
            return Collections.emptyMap();
        }
        Map<Long, List<DataSheetColumn>> columnsMap = dataSheetColumnMapper.selectList(i ->
                        i.in(DataSheetColumn::getDataSheetId, dataSheetIds)).
                stream().collect(Collectors.groupingBy(DataSheetColumn::getDataSheetId));
        return dataSheetMapper.selectListInIds(dataSheetIds, i -> i
                        .select(DataSheet::getDataUpdateTime, DataSheet::getSqlText,
                                DataSheet::getId))
                .stream().collect(Collectors.toMap(IdEntity::getId, i -> {
                    List<DataSheetColumnSimpleVO> sheetColumns = listAToListB(columnsMap.get(i.getId()), DataSheetColumnSimpleVO.class);
                    return new DataSheetExtraInfo(i.getDataUpdateTime(), DynamicBlocks.extractVariables(i.getSqlText()),
                            sheetColumns.stream().collect(Collectors.toMap(DataSheetColumnSimpleVO::getId, j -> j)));
                }));
    }

    public DataSheetVO get(Long id) {
        return aToB(getSheet(id), DataSheetVO.class, (a, b) -> {
            b.setVariableNames(DynamicBlocks.extractVariables(a.getSqlText()));
        });
    }

    private DataSheet getSheet(Long id) {
        DataSheet sheet = dataSheetMapper.selectById(id);
        if (sheet == null) {
            throw new BizException(ErrorCode.define("数据集不存在"));
        }
        return sheet;
    }

    public DataResult getData(SheetDataGetParam param) {
        DataSheet sheet = getSheet(param.getId());
        String sqlText = sheet.getSqlText();
        if (sqlText == null || sqlText.trim().isEmpty()) {
            return DataResult.empty();
        }
        List<DataSheetColumn> columns = getColumns(param.getId(), param.getColumns());
        String columnsStr = "*";
        if (param.getColumns() != null && !param.getColumns().isEmpty()) {
            columnsStr = String.join(",", param.getColumns());
        } else if ((param.isPreview() && !columns.isEmpty())) {
            columnsStr = listAToListB(columns, DataSheetColumnVO.class).stream()
                    .map(i -> String.format("`%s` AS `%s`", i.getName(), i.getDesc()))
                    .collect(Collectors.joining(","));
        }
        Map<String, Object> parameters = new HashMap<>(sheet.getCfg().getParameterDefaultValues());
        if (param.getParameters() != null) {
            parameters.putAll(param.getParameters());
        }
        if (StringUtils.isEmpty(sqlText)) {
            return DataResult.empty();
        }
        return dataClientFacade.queryForResult(
                DataQueryRequest.builder()
                        .dataSheetId(sheet.getId())
                        .datasourceId(sheet.getDatasourceId())
                        .limit(500)
                        .calcTotal(true)
                        .sqlText(String.format("SELECT %s FROM (%s) TMP", columnsStr, sqlText))
                        .variables(parameters)
                        .forceRefresh(false)
                        .env(param.getEnv())
                        .build());
    }

    public DataSheetDetailVO getDetail(Long id) {
        return aToB(dataSheetMapper.selectById(id), DataSheetDetailVO.class, (a, b) -> {
            b.setColumns(listAToListB(getColumns(id), DataSheetColumnVO.class));
        });
    }

    public Long create(DataSheet dataSheet) {
        dataSheet.setSqlText("");
        dataSheetMapper.insert(dataSheet);
        return dataSheet.getId();
    }

    /**
     * 更新数据集表结构字段
     *
     * @param dataSheetId 数据集ID
     */
    @Transactional(rollbackFor = Exception.class)
    public synchronized void updateColumns(Long dataSheetId) {
        DataSheet sheet = dataSheetMapper.selectById(dataSheetId);
        DataResult result;
        try {
            result = dataClientFacade.queryForResult(
                    DataQueryRequest.builder()
                            .dataSheetId(sheet.getId())
                            .datasourceId(sheet.getDatasourceId())
                            .sqlText(sheet.getSqlText())
                            .limit(1)
                            .variables(sheet.getCfg().getParameterDefaultValues())
                            .forceRefresh(true)
                            .build());
        } catch (Exception e) {
            throw new BizException(ErrorCode.define("解析异常"), e);
        }
        List<Map<String, Object>> mapList = result.toMapList();
        if (mapList.isEmpty() || mapList.get(0) == null) {
            throw new BizException(ErrorCode.define("没有数据"));
        }
        Map<String, Object> map = mapList.get(0);
        List<DataSheetColumn> columns = dataSheetColumnMapper.selectList(i -> i
                .eq(DataSheetColumn::getDataSheetId, dataSheetId).last("FOR UPDATE"));
        Map<String, DataSheetColumn> columnMap = columns.stream()
                .collect(Collectors.toMap(DataSheetColumn::getName, i -> i));
        map.forEach((key, value) -> {
            String valueType = value == null ? "String" : value.getClass().getSimpleName();
            SheetColumnDataType dataType = SheetColumnDataType.ofColumnType(valueType);
            if (!columnMap.containsKey(key)) {
                SheetColumnType columnType = SheetColumnType.ofColumn(valueType, key);
                DataSheetColumn column = new DataSheetColumn();
                column.setColumnType(columnType);
                column.setOriginDataType(dataType);
                column.setDataType(dataType);
                column.setDataSheetId(dataSheetId);
                column.setName(key);
                column.setOriginType(valueType);
                column.setOriginName(key);
                dataSheetColumnMapper.insert(column);
            } else {
                DataSheetColumn column = columnMap.get(key);
                column.setOriginType(valueType);
                column.setOriginDataType(dataType);
                dataSheetColumnMapper.updateById(column);
            }
        });
        for (DataSheetColumn column : columns) {
            if (!map.containsKey(column.getOriginName())) {
                dataSheetColumnMapper.deleteById(column.getId());
            }
        }
    }

    public void updateColumn(DataSheetColumnForm form) {
        dataSheetColumnMapper.updateById(aToB(form, DataSheetColumn.class));
    }

    public Set<Object> getColumnValues(Long dataSheetId, Long columnId) {
        DataSheetColumn column = dataSheetColumnMapper.selectById(columnId);
        if (column == null) {
            throw new BizException(ErrorCode.define("列不存在"));
        }
        DataSheet sheet = dataSheetMapper.selectById(dataSheetId);
        DataSet dataSet = dataClientFacade.queryForDataSet(
                DataQueryRequest.builder()
                        .datasourceId(sheet.getDatasourceId())
                        .sqlText(String.format("SELECT DISTINCT %s as VALUE FROM (%s) AS TMP",
                                column.getOriginName(), sheet.getSqlText()))
                        .build());
        return new HashSet<>(dataSet.getOneList());
    }

    @Transactional(rollbackFor = Exception.class)
    @FileNodeUpdate(bizType = FileBizTypes.DATA_SHEET)
    public void modify(DataSheet form) {
        DataSheet sheet = dataSheetMapper.selectById(form.getId());
        sheet.setSqlText(form.getSqlText());
        sheet.setCfg(form.getCfg());
        dataSheetMapper.updateById(sheet);
    }

    public List<DataSheetVO> list() {
        return listAToListB(dataSheetMapper.selectList(i -> i.orderByDesc(DataSheet::getId)), DataSheetVO.class);
    }

    public List<DataSheet> listSimple() {
        return dataSheetMapper.selectList(i -> i.select(DataSheet::getId, DataSheet::getName));
    }
}
