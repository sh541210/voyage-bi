package top.fusb.voyagebi.service.impl;

import io.micrometer.common.util.StringUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.server.mybatis.IdEntity;
import org.example.server.web.ErrorCode;
import org.example.server.web.exception.BizException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import top.fusb.bi.data.base.utils.SqlBuilder;
import top.fusb.voyagebi.domain.*;
import top.fusb.voyagebi.domain.VO.ChartLabel;
import top.fusb.voyagebi.domain.VO.ChartVO;
import top.fusb.voyagebi.domain.VO.DataResult;
import top.fusb.voyagebi.domain.VO.DataSet;
import top.fusb.voyagebi.domain.request.ChartDataRequest;
import top.fusb.voyagebi.domain.request.ChartGroupForm;
import top.fusb.voyagebi.domain.request.DrillDownParam;
import top.fusb.voyagebi.persist.entity.*;
import top.fusb.voyagebi.persist.mapper.*;
import top.fusb.voyagebi.service.DataSheetService;
import top.fusb.voyagebi.service.facade.DataClientFacade;
import top.fusb.voyagebi.service.facade.DataQueryRequest;
import top.fusb.voyagebi.websocket.DataUpdater;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.example.server.web.utils.BeanUtils.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChartService {
    private final ChartMapper chartMapper;
    private final DashboardShareMapper dashboardShareMapper;
    private final ChartGroupMapper chartGroupMapper;
    private final DataSheetColumnMapper dataSheetColumnMapper;
    private final DataSheetMapper dataSheetMapper;
    private final DashboardMapper dashboardMapper;
    private final DataSheetService dataSheetService;
    private final DataClientFacade dataClientFacade;
    private final DatasourceMapper datasourceMapper;

    public List<ChartVO> getChartVOList(Long dashboardId) {
        List<Chart> chartList = getChartList(dashboardId);
        List<Long> dataSheetIds = chartList.stream().map(Chart::getDataSheetId).toList();
        Map<Long, String> map = new HashMap<>();
        Map<Long, DataSheetExtraInfo> dataSheetExtraInfoMap = dataSheetService.getDataSheetExtraInfo(dataSheetIds);
        if (!dataSheetIds.isEmpty()) {
            map.putAll(dataSheetColumnMapper.selectList(i -> i
                            .select(DataSheetColumn::getId, DataSheetColumn::getName)
                            .in(DataSheetColumn::getDataSheetId, dataSheetIds))
                    .stream().collect(Collectors.toMap(IdEntity::getId, DataSheetColumn::getName)));
        }
        return listAToListB(chartList, ChartVO.class, (a, b) -> {
            DataSheetExtraInfo info = dataSheetExtraInfoMap.get(a.getDataSheetId());
            if (info != null) {
                b.setDataUpdateTime(info.getDataUpdateTime());
                b.setVariableNames(info.getVariableNames());
                b.getCfg().updateColumns(info.getColumns());
            }
            List<Column> allColumns = a.getCfg().getAllColumns();
            if (!allColumns.isEmpty()) {
                boolean anyMatch = allColumns.stream().anyMatch(i -> map.containsKey(i.getId()));
                b.setColumnNotFound(!anyMatch);
            }
            if (a.getGroupId() != null) {
                ChartGroup chartGroup = chartGroupMapper.selectById(a.getGroupId());
                if (chartGroup != null) {
                    b.setGroupSubTitle(chartGroup.getSubTitle());
                    b.setGroupTitle(chartGroup.getTitle());
                    b.setGroupName(chartGroup.getTitle());
                }
            }
        });
    }

    public List<Chart> getChartList(Long dashboardId) {
        return chartMapper.selectList(i -> i.eq(Chart::getDashboardId, dashboardId));
    }

    public DataResult fetchData(ChartDataRequest dataRequest) {
        return fetchData(dataRequest, null);
    }

    public DataResult fetchData(ChartDataRequest dataRequest, DataUpdater updater) {
        String env = dataRequest.getEnv();
        ChartCfg chartCfg;
        Long datasourceId;
        Long dataSheetId;
        String sqlText;
        Map<String, Object> parameterDefaultValues = new HashMap<>();
        boolean shared = StringUtils.isNotEmpty(dataRequest.getShareKey());
        // 分享的仪表盘查询
        if (shared) {
            DashboardShare share = dashboardShareMapper.selectOne(i ->
                    i.select(DashboardShare::getDashboardSnapshot,
                                    DashboardShare::getDataSheetSnapshot,
                                    DashboardShare::getDataSheetSnapshots)
                            .eq(DashboardShare::getKey, dataRequest.getShareKey()));
            List<ChartSnapshot> charts = share.getDashboardSnapshot().getCharts();
            ChartSnapshot chartSnapshot = charts.stream().filter(i -> i.getId().equals(dataRequest.getChartId())).findFirst()
                    .orElseThrow(() -> new BizException(-3, "图表不存在"));
            dataSheetId = chartSnapshot.getDataSheetId();
            chartCfg = chartSnapshot.getCfg();
            if (share.getDataSheetSnapshots() != null) {
                DataSheetSnapshotV2 snapshot = share.getDataSheetSnapshots().get(dataSheetId);
                sqlText = snapshot.getSqlText();
                parameterDefaultValues.putAll(snapshot.getDataSheetCfg().getParameterDefaultValues());
                if (StringUtils.isEmpty(env)) {
                    env = snapshot.getDatasourceEnv();
                }
            } else {
                sqlText = share.getDataSheetSnapshot().getSqlTextMap().get(dataSheetId);
                DataSheetCfg dataSheetCfg = share.getDataSheetSnapshot().getDataSheetCfgMap().get(dataSheetId);
                parameterDefaultValues.putAll(Optional.ofNullable(dataSheetCfg).map(DataSheetCfg::getParameterDefaultValues).orElse(Map.of()));
            }
            datasourceId = chartSnapshot.getDatasourceId();
        } else {
            // 编辑的仪表盘查询
            Chart chart = chartMapper.selectById(dataRequest.getChartId());
            chartCfg = Optional.ofNullable(dataRequest.getChartCfg()).orElse(chart.getCfg());
            DataSheet dataSheet = dataSheetMapper.getById(chart.getDataSheetId());
            if (dataSheet == null) {
                throw new BizException(ErrorCode.define("数据集不存在"));
            }
            sqlText = dataSheet.getSqlText();
            dataSheetId = chart.getDataSheetId();
            datasourceId = dataSheet.getDatasourceId();
            if (StringUtils.isEmpty(env)) {
                env = datasourceMapper.selectValueById(Datasource::getCfgStore, datasourceId).getDefaultEnv();
            }
            parameterDefaultValues.putAll(dataSheet.getCfg().getParameterDefaultValues());
        }
        // 设置limit
        Integer limit = getLimit(dataRequest, chartCfg);
        // 设置变量
        Map<String, Object> parameters = new LinkedHashMap<>();
        parameters.putAll(parameterDefaultValues);
        parameters.putAll(chartCfg.getParameterConditions());
        parameters.putAll(Optional.ofNullable(dataRequest.getParameters()).orElse(new HashMap<>()));
        DrillDownParam param = dataRequest.getDrillDownParam();
        if (param != null) {
            // 处理下钻逻辑
            for (DrillDownParam.FilterValue filter : param.getFilters()) {
                Condition condition = new Condition();
                condition.setId(filter.getColumnId());
                condition.setValue(filter.getValues());
                condition.setOperation(Condition.ConditionOperation.IN);
                chartCfg.getConditions().add(condition);
            }
            Long groupByColumnId = param.getColumnId();
            if (groupByColumnId != null) {
                Column column = new Column();
                column.setId(groupByColumnId);
                chartCfg.setGroupBy(List.of(column));
            }
        }
        // 设置列数据
        List<Long> allColumnIds = new ArrayList<>(chartCfg.getAllColumns().stream().map(Column::getId)
                .toList());
        Map<Long, DataSheetColumn> columnMap = dataSheetColumnMapper.selectListInIds(new HashSet<>(allColumnIds),
                        i -> i.select(DataSheetColumn::getId,
                                DataSheetColumn::getOriginType,
                                DataSheetColumn::getName,
                                DataSheetColumn::getComment,
                                DataSheetColumn::getDescription))
                .stream().collect(Collectors.toMap(IdEntity::getId, i -> i));
        for (Column column : chartCfg.getAllColumns()) {
            DataSheetColumn sheetColumn = columnMap.get(column.getId());
            if (sheetColumn != null) {
                column.setName(sheetColumn.getName());
                column.setValueType(sheetColumn.getOriginType());
                if (org.apache.commons.lang3.StringUtils.isEmpty(column.getAlias())) {
                    String alias = Optional.ofNullable(sheetColumn.getDescription()).orElse(sheetColumn.getComment());
                    column.setAlias(alias);
                }
            }
        }
        // 设置排序参数
        List<Sort> allSorts = chartCfg.getAllSorts(Optional.ofNullable(dataRequest.getSorts()).orElse(List.of()));
        String sql = SqlBuilder.buildSql(shared ? ("-- share \n" + sqlText) : sqlText,
                chartCfg.getGroupByColumns(),
                chartCfg.getGroupValues(),
                chartCfg.getValueColumns(),
                chartCfg.getConditionsSql(),
                allSorts.stream().map(Sort::toString).toList());
        DataQueryRequest queryRequest = DataQueryRequest.builder()
                .datasourceId(datasourceId)
                .sqlText(sql)
                .limit(limit)
                .variables(parameters)
                .forceRefresh(dataRequest.getDataMode().forceRefresh)
                .env(env)
                .clearMetadata(dataRequest.isClearMetadata())
                .dataSheetId(dataSheetId)
                .countSql(dataRequest.isCalcCount())
                .pagination(dataRequest.getPagination())
                .requestId(dataRequest.getRequestId())
                .build();
        String finalEnv = env;
        Function<DataResult, DataResult> wrapper = dataResult -> {
            if (dataResult.isSuccess()) {
                DataSet data = dataResult.getData();
                if (data != null) {
                    data.setXY(chartCfg.getX().size(), chartCfg.getY().size());
                    data.setDatasheetId(data.getDatasheetId());
                    data.setDatasourceId(datasourceId);
                    data.setEnv(finalEnv);
                    data.setDatasheetId(dataSheetId);
                }
            }
            return dataResult;
        };
        if (updater != null) {
            queryRequest.setDataResultConsumer(i -> updater.useData(wrapper.apply(i)));
        }
        return wrapper.apply(dataClientFacade.queryForResult(queryRequest));
    }

    private Integer getLimit(ChartDataRequest dataRequest, ChartCfg cfg) {
        if (dataRequest.isTotal()) {
            return null;
        }
        var limit = Optional.ofNullable(cfg.getLimit()).orElse(1000);
        if (dataRequest.isPreview()) {
            return Math.min(500, limit);
        }
        return Optional.ofNullable(dataRequest.getChartCfg())
                .map(ChartCfg::getLimit)
                .orElse(limit);
    }

    @Transactional(rollbackFor = Exception.class)
    public long copyChart(Long dashboardId, Long chartId) {
        Chart chart = chartMapper.selectOne(i -> i.eq(Chart::getId, chartId)
                .eq(Chart::getDashboardId, dashboardId));
        chart.setId(null);
        chartMapper.insert(chart);
        updateGroupChartIds(chart.getGroupId());
        return chart.getId();
    }

    public List<ChartLabel> chartLabelList(Long dashboardId) {
        return listAToListB(chartMapper.selectList(i -> i.select(Chart::getId, Chart::getName)
                .eq(dashboardId != null, Chart::getDashboardId, dashboardId)), ChartLabel.class);
    }

    @Transactional(rollbackFor = Exception.class)
    public Long createChart(ChartVO form) {
        Chart chart = aToBIgnoreId(form, Chart.class);
        chart.setCfg(new ChartCfg());
        chart.setStyleCfg(new HashMap<>());
        chartMapper.insert(chart);
        updateGroupChartIds(form.getGroupId());
        return chart.getId();
    }

    public void updateGroupChartIds(Long groupId) {
        if (groupId != null) {
            List<Long> chartIds = chartMapper.selectValueList(Chart::getId, i -> i.eq(Chart::getGroupId, groupId));
            ChartGroup g = new ChartGroup();
            g.setChartIds(chartIds);
            g.setId(groupId);
            chartGroupMapper.updateById(g);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public Long saveChartGroup(ChartGroupForm groupForm) {
        ChartGroup chartGroup = aToB(groupForm, ChartGroup.class);
        Long groupId = groupForm.getId();
        if (groupId != null && groupId > 0) {
            chartGroupMapper.updateById(chartGroup);
        } else {
            chartGroup.setCfg(new ChartGroupCfg());
            chartGroup.setStyleCfg(Map.of());
            chartGroupMapper.insert(chartGroup);
            groupId = chartGroup.getId();
        }
        Long finalGroupId = groupId;
        List<Chart> charts = chartMapper.selectList(i -> i.eq(Chart::getGroupId, finalGroupId));
        for (Chart chart : charts) {
            chartMapper.updateById(chart.getId(), i -> i.set(Chart::getGroupId, null));
        }
        for (Long chartId : groupForm.getChartIds()) {
            chartMapper.updateById(chartId, i -> i.set(Chart::getGroupId, finalGroupId));
        }
        return groupId;
    }

    public void updateChartGroupStyle(ChartGroupForm groupForm) {
        ChartGroup group = new ChartGroup();
        group.setId(groupForm.getId());
        group.setStyleCfg(groupForm.getStyleCfg());
        chartGroupMapper.updateById(group);
    }

    public void removeGroup(Long dashboardId, Long groupId) {
        long count = chartMapper.countBy(i -> i.eq(Chart::getGroupId, groupId)
                .eq(Chart::getDashboardId, dashboardId));
        if (count > 0) {
            throw new RuntimeException("存在图表关联");
        }
        chartGroupMapper.deleteById(groupId);
    }

    public ChartVO getChart(Long id) {
        ChartVO chart = aToB(chartMapper.selectById(id), ChartVO.class);
        if (chart == null) {
            throw new BizException(ErrorCode.define("图表不存在"));
        }
        Map<Long, DataSheetExtraInfo> map = dataSheetService.getDataSheetExtraInfo(List.of(chart.getDataSheetId()));
        DataSheetExtraInfo info = map.get(chart.getDataSheetId());
        if (info != null) {
            chart.setDataUpdateTime(info.getDataUpdateTime());
            chart.setVariableNames(info.getVariableNames());
            chart.getCfg().updateColumns(info.getColumns());
        }
        return chart;
    }

    @Transactional(rollbackFor = Exception.class)
    public void removeChart(Long dashboardId, Long id) {
        Chart chart = chartMapper.selectOne(i -> i.eq(Chart::getId, id)
                .eq(Chart::getDashboardId, dashboardId));
        if (chart != null) {
            chartMapper.deleteById(id);
            updateGroupChartIds(chart.getGroupId());
        }
    }

    public void changeSheet(Long chartId, Long dataSheetId, Long dashboardId) {
        Chart chart = chartMapper.selectById(chartId);
        List<Column> values = chart.getCfg().getValues();
        List<Column> groupBy = chart.getCfg().getGroupBy();
        List<Condition> conditions = chart.getCfg().getConditions();
        Map<String, DataSheetColumn> map = dataSheetService.getColumns(dataSheetId)
                .stream().collect(Collectors.toMap(DataSheetColumn::getName, i -> i, (a, b) -> b));
        Stream.of(values, groupBy, conditions).flatMap(Collection::stream).forEach(column -> {
            DataSheetColumn col = map.get(column.getName());
            if (col != null) {
                column.setId(col.getId());
            }
        });
        chart.setDataSheetId(dataSheetId);
        chartMapper.updateById(chart);
    }

    public String getName(Long chartId) {
        return chartMapper.getName(chartId);
    }
}
