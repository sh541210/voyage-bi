package top.fusb.voyagebi.service;

import org.springframework.transaction.annotation.Transactional;
import top.fusb.voyagebi.domain.DashboardCfg;
import top.fusb.voyagebi.domain.VO.ChartGroupVO;
import top.fusb.voyagebi.domain.VO.DashboardSimpleVO;
import top.fusb.voyagebi.domain.VO.DashboardVO;
import top.fusb.voyagebi.domain.request.DashboardEditForm;
import top.fusb.voyagebi.persist.entity.Dashboard;

import java.util.List;

public interface DashboardService {
    void updateStyle(Dashboard dashboard);

    List<DashboardSimpleVO> listByAppId(Long appId);

    List<ChartGroupVO> getGroups(Long dashboardId);

    void updateLayout(Dashboard dashboard);

    DashboardVO getDashboard(Long id);

    @Transactional(rollbackFor = Exception.class)
    void changeAppId(Long appId, List<Long> dashboardIds);

    void editCfg(Long dashboardId, DashboardCfg cfg);

    Long edit(DashboardEditForm form);

    Long create(DashboardEditForm dashboard);
}
