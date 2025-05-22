package top.fusb.voyagebi.service.impl;

import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.RandomStringUtils;
import org.example.server.mybatis.IdEntity;
import org.example.server.web.exception.BizException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import top.fusb.voyagebi.domain.*;
import top.fusb.voyagebi.domain.VO.*;
import top.fusb.voyagebi.domain.annotation.FileNodeUpdate;
import top.fusb.voyagebi.domain.request.DashboardEditForm;
import top.fusb.voyagebi.domain.request.DashboardShareForm;
import top.fusb.voyagebi.persist.entity.*;
import top.fusb.voyagebi.persist.mapper.*;
import top.fusb.voyagebi.service.DashboardService;
import top.fusb.voyagebi.service.DashboardShareService;

import java.util.*;
import java.util.stream.Collectors;

import static org.example.server.web.utils.BeanUtils.*;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService, DashboardShareService {
    private final ChartService chartService;
    private final DashboardMapper dashboardMapper;
    private final DashboardShareMapper dashboardShareMapper;
    private final DataSheetMapper dataSheetMapper;
    private final ChartGroupMapper chartGroupMapper;
    private final ThemeMapper themeMapper;
    private final DataSheetServiceImpl dataSheetService;
    private final DatasourceMapper datasourceMapper;

    /**
     * 获取当前仪表盘下的图表组集合
     *
     * @param dashboardId 仪表盘ID
     * @return 图表组集合
     */
    @Override
    public List<ChartGroupVO> getGroups(Long dashboardId) {
        List<ChartGroup> chartGroups = chartGroupMapper.selectList(i -> i
                .eq(ChartGroup::getDashboardId, dashboardId));
        return listAToListB(chartGroups, ChartGroupVO.class);
    }

    @FileNodeUpdate(bizType = FileBizTypes.DASHBOARD)
    @Override
    public void updateLayout(Dashboard dashboard) {
        Dashboard dash = new Dashboard();
        dash.setId(dashboard.getId());
        dash.setLayoutCfg(dashboard.getLayoutCfg());
        dashboardMapper.updateById(dash);
    }

    @Override
    public DashboardVO getDashboard(Long dashboardId) {
        Dashboard dashboard = dashboardMapper.selectById(dashboardId);
        List<ChartGroupVO> groups = getGroups(dashboardId);
        Map<Long, List<Long>> chartMap = groups.stream()
                .collect(Collectors.toMap(ChartGroupVO::getId, ChartGroupVO::getChartIds));
        List<ChartVO> chartList = chartService.getChartVOList(dashboard.getId());
        chartList.sort(Comparator
                .comparing(ChartVO::getGroupId, Comparator.nullsLast(Comparator.naturalOrder()))  // 处理 groupId 为 null 的情况，将其排在最后
                .thenComparing(c -> {
                    List<Long> chartIds = chartMap.get(c.getGroupId());
                    return chartIds != null ? chartIds.indexOf(c.getId()) : Integer.MAX_VALUE;  // 根据 chartMap 中的顺序排序，找不到则按默认顺序
                }));
        return aToB(dashboard, DashboardVO.class, (a, b) -> {
            b.setCharts(chartList);
            b.setGroups(groups);
        });
    }

    @Override
    public DashboardShare toShare(DashboardShareForm param) {
        DashboardVO dashboard = getDashboard(param.getDashboardId());
//        Map<Long, String> sqlTextMap = new HashMap<>();
//        Map<Long, DataSheetCfg> dataSheetCfgMap = new HashMap<>();
        Set<Long> dataSheetIds = new HashSet<>();
        Map<Long, DataSheetSnapshotV2> dataSheetSnapshots = new HashMap<>();
        DashboardSnapshot snapshot = aToB(dashboard, DashboardSnapshot.class, (a, b) -> {
            // 设置图表数据
            b.setCharts(listAToListB(a.getCharts(), ChartSnapshot.class, (c, c2) -> {
                // 图表使用的数据集
                dataSheetIds.add(c.getDataSheetId());
                ChartCfg cfg = c.getCfg();
                for (FilterCfg filter : cfg.getFilters()) {
                    Long dataSheetId = filter.dataSheetId();
                    // 筛选器中涉及到的数据集
                    if (dataSheetId != null) dataSheetIds.add(dataSheetId);
                }
            }));
            b.setGroups(listAToListB(a.getGroups(), ChartGroupSnapshot.class));
        });
        if (!dataSheetIds.isEmpty()) {
            // 设置数据集数据
            List<DataSheet> dataSheets = dataSheetMapper.selectListInIds(new ArrayList<>(dataSheetIds));
            Map<Long, String> defaultEnvs = datasourceMapper.selectListInIds(dataSheetIds).stream().collect(Collectors.toMap(IdEntity::getId,
                    i -> i.getCfgStore().getDefaultEnv()));
            dataSheetSnapshots.putAll(dataSheets.stream().collect(Collectors.toMap(IdEntity::getId,
                    i -> aToB(i, DataSheetSnapshotV2.class, (a, b) -> {
                        b.setDatasourceEnv(defaultEnvs.get(a.getDatasourceId()));
                        b.setDataSheetCfg(a.getCfg());
                    }))));
            // 将所有使用到的数据集存储一个map作为snapshot，避免编辑更新时影响
//            sqlTextMap.putAll(dataSheets.stream().collect(Collectors.toMap(IdEntity::getId, DataSheet::getSqlText)));
//            dataSheetCfgMap.putAll(dataSheets.stream().collect(Collectors.toMap(IdEntity::getId, DataSheet::getCfg)));
            Map<Long, DataSheet> map = dataSheets.stream().collect(Collectors.toMap(IdEntity::getId, i -> i));
            for (ChartSnapshot chart : snapshot.getCharts()) {
                DataSheet sheet = map.get(chart.getDataSheetId());
                if (sheet != null) {
                    chart.setDatasourceId(sheet.getDatasourceId());
                }
            }
        }
        DashboardShare share = aToB(param, DashboardShare.class);
        share.setDashboardSnapshot(snapshot);
        share.setType(dashboard.getType());
        share.setName(Optional.ofNullable(param.getName()).orElse(dashboard.getName()));
        share.setDataSheetSnapshot(new DataSheetSnapshot());
        share.setDataSheetSnapshots(dataSheetSnapshots);
        share.setDashboardId(dashboard.getId());
        return share;
    }

    @Override
    public void createShare(DashboardShareForm param) {
        DashboardShare share = toShare(param);
        Long appId = dashboardMapper.selectValue(Dashboard::getAppId, i -> i.eq(Dashboard::getId, param.getDashboardId()));
        share.setAppId(appId);
        while (true) {
            String key = RandomStringUtils.randomAlphanumeric(16);
            if (dashboardShareMapper.countBy(i -> i.eq(DashboardShare::getKey, key)) == 0) {
                share.setKey(key);
                break;
            }
        }
        dashboardShareMapper.insert(share);
    }

    @Override
    public void updateShare(DashboardShareForm param) {
        dashboardShareMapper.updateBy(toShare(param),
                i -> i.eq(DashboardShare::getKey, param.getKey()));
    }

    @Override
    @FileNodeUpdate(bizType = FileBizTypes.DASHBOARD)
    public Long create(DashboardEditForm form) {
        return dashboardMapper.create(form).getId();
    }

    @Override
    public void setEnabled(Long id, Boolean enabled) {
        dashboardShareMapper.updateById(id, i -> i.set(DashboardShare::getEnabled, enabled));
    }

    @Override
    public List<DashboardSimpleVO> listByAppId(Long appId) {
        return listAToListB(dashboardMapper.selectList(i -> i
                        .eq(appId != null, Dashboard::getAppId, appId)),
                DashboardSimpleVO.class, (a, b) -> b.setTypeName(a.getType().getName()));
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    @FileNodeUpdate(bizType = FileBizTypes.DASHBOARD)
    public Long edit(DashboardEditForm form) {
        Dashboard dashboard = dashboardMapper.selectById(form.getId());
        Long appId = dashboard.getAppId();
        Long newId = form.getAppId();
        if (!Objects.equals(appId, newId)) dashboardShareMapper.updateBy(i -> i.set(DashboardShare::getAppId, newId)
                .eq(DashboardShare::getDashboardId, form.getId()));
        dashboardMapper.updateById(aToB(form, Dashboard.class));
        return form.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public void changeAppId(Long appId, List<Long> dashboardIds) {
        dashboardMapper.updateBy(i -> i.set(Dashboard::getAppId, 0)
                .eq(Dashboard::getAppId, appId));
        dashboardShareMapper.updateBy(i -> i.set(DashboardShare::getAppId, 0)
                .eq(DashboardShare::getAppId, appId));
        if (dashboardIds != null && !dashboardIds.isEmpty()) {
            dashboardMapper.updateBy(i -> i.set(Dashboard::getAppId, appId)
                    .in(Dashboard::getId, dashboardIds));
            dashboardShareMapper.updateBy(i -> i.set(DashboardShare::getAppId, appId)
                    .in(DashboardShare::getDashboardId, dashboardIds));
        }
    }

    @FileNodeUpdate(bizRefIdName = "dashboardId",
            requestType = FileNodeUpdate.RequestType.PARAMS,
            bizType = FileBizTypes.DASHBOARD)
    @Override
    public void editCfg(Long dashboardId, DashboardCfg cfg) {
        Dashboard dashboard = new Dashboard();
        dashboard.setId(dashboardId);
        dashboard.setCfg(cfg);
        dashboardMapper.updateById(dashboard);
    }

    @Override
    public void removeShare(Long id) {
        dashboardShareMapper.deleteById(id);
    }

    @Override
    public void existShare(String key) {
        DashboardShare share = dashboardShareMapper.selectOne(
                i -> i.select(DashboardShare::getEnabled)
                        .eq(DashboardShare::getKey, key));
        if (share == null) throw new BizException(-2, "没有找到仪表盘");
        if (!share.getEnabled()) throw new BizException(-3, "仪表盘已关闭分享");
    }

    @Override
    public List<DashboardSnapshotVO> getDashboardShareListByKeys(String keys) {
        List<String> keyList = Arrays.asList(keys.split(","));
        Map<String, DashboardShare> shares = dashboardShareMapper.selectList(i -> i
                        .in(DashboardShare::getKey, keyList)
                        .orderByDesc(DashboardShare::getUpdateTime))
                .stream().collect(Collectors.toMap(DashboardShare::getKey, i -> i));
        List<DashboardSnapshotVO> shareList = new ArrayList<>();
        List<Long> chartIds = shares.values().stream().filter(DashboardShare::getEnabled)
                .flatMap(i -> i.getDashboardSnapshot().getCharts().stream())
                .map(ChartSnapshot::getDataSheetId).toList();
        Map<Long, DataSheetExtraInfo> sheetExtraInfoMap = dataSheetService
                .getDataSheetExtraInfo(chartIds);
        for (String key : keyList) {
            if (!shares.containsKey(key)) throw new BizException(-2, "没有找到仪表盘");
            DashboardShare share = shares.get(key);
            if (!share.getEnabled()) throw new BizException(-3, "仪表盘已关闭分享");
            Theme theme = themeMapper.selectById(share.getThemeId());
            DashboardSnapshot snapshot = share.getDashboardSnapshot();
            DashboardSnapshotVO vo = aToB(share, DashboardSnapshotVO.class);
            copyAToB(snapshot, vo, (a, b) -> {
                for (ChartSnapshot chart : a.getCharts()) {
                    var info = sheetExtraInfoMap.get(chart.getDataSheetId());
                    if (info != null) {
                        chart.setDataUpdateTime(info.getDataUpdateTime());
                        chart.setVariableNames(info.getVariableNames());
                        chart.getCfg().updateColumns(info.getColumns());
                    }
                }
                b.setCharts(listAToListB(a.getCharts(), ChartVO.class));
                b.setGroups(listAToListB(a.getGroups(), ChartGroupVO.class));
                b.setTheme(aToB(theme, ThemeVO.class));
                b.setKey(key);
                b.setType(share.getType());
                b.setName(share.getName());
            });
            shareList.add(vo);
        }
        return shareList;
    }

    @Override
    public List<DashboardShareVO> getShareList(Long dashboardId, Long appId) {
        return listAToListB(dashboardShareMapper.selectList(i ->
                i.eq(appId != null, DashboardShare::getAppId, appId)
                        .eq(dashboardId != null, DashboardShare::getDashboardId, dashboardId)), DashboardShareVO.class);
    }

    @Override
    public Map<String, DashboardSimpleVO> getInfoListByKeys(String keys) {
        List<String> list = Arrays.asList(keys.split(","));
        if (list.isEmpty()) return Map.of();
        return dashboardShareMapper.selectList(i -> i.in(DashboardShare::getKey, list))
                .stream().collect(Collectors.toMap(DashboardShare::getKey, i -> aToB(i, DashboardSimpleVO.class)));
    }

    @Override
    @FileNodeUpdate(bizType = FileBizTypes.DASHBOARD)
    public void updateStyle(Dashboard dashboard) {
        Dashboard origin = dashboardMapper.selectById(dashboard.getId());
        origin.setStyleCfg(dashboard.getStyleCfg());
        dashboardMapper.updateById(origin);
    }
}
