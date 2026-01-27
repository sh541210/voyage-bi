package top.fusb.voyagebi.controller;

import lombok.RequiredArgsConstructor;
import org.example.server.web.annotation.ResultController;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import top.fusb.voyagebi.domain.DashboardCfg;
import top.fusb.voyagebi.domain.VO.ChartGroupVO;
import top.fusb.voyagebi.domain.VO.DashboardSimpleVO;
import top.fusb.voyagebi.domain.VO.DashboardVO;
import top.fusb.voyagebi.domain.request.DashboardEditForm;
import top.fusb.voyagebi.persist.entity.Dashboard;
import top.fusb.voyagebi.service.DashboardService;
import top.fusb.voyagebi.web.resource.node.domain.RequestType;
import top.fusb.voyagebi.web.resource.node.domain.annotation.LockCheck;

import java.util.List;

/**
 * 仪表盘控制器，处理与仪表盘相关的API请求
 */
@ResultController("api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService dashboardService;

    /**
     * 创建仪表盘
     * @param dashboard 仪表盘编辑表单
     * @return 创建的仪表盘ID
     */
    @PostMapping
    public Long create(@RequestBody @Validated DashboardEditForm dashboard) {
        return dashboardService.create(dashboard);
    }

    /**
     * 编辑仪表盘
     * @param form 仪表盘编辑表单
     * @return 编辑后的仪表盘ID
     */
    @PutMapping
    @LockCheck(checkType = LockCheck.CheckType.dashboard)
    public Long edit(@RequestBody @Validated DashboardEditForm form) {
        return dashboardService.edit(form);
    }

    /**
     * 编辑仪表盘配置
     * @param dashboardId 仪表盘ID
     * @param cfg 仪表盘配置
     */
    @PutMapping("cfg/{dashboardId}")
    @LockCheck(checkType = LockCheck.CheckType.dashboard,
            requestType = RequestType.PATH_VARIABLES,
            idName = "dashboardId")
    public void editCfg(@PathVariable("dashboardId") Long dashboardId,
                        @RequestBody DashboardCfg cfg) {
        dashboardService.editCfg(dashboardId, cfg);
    }

    /**
     * 根据ID获取仪表盘
     * @param id 仪表盘ID
     * @return 仪表盘视图对象
     */
    @GetMapping
    public DashboardVO getDashboard(@RequestParam("id") Long id) {
        return dashboardService.getDashboard(id);
    }

    /**
     * 修改仪表盘样式
     * @param dashboard 仪表盘对象，包含样式信息
     */
    @PutMapping("style")
    @LockCheck(checkType = LockCheck.CheckType.dashboard)
    public void editStyle(@RequestBody Dashboard dashboard) {
        dashboardService.updateStyle(dashboard);
    }

    /**
     * 修改仪表盘布局
     * @param dashboard 仪表盘对象，包含布局信息
     */
    @PutMapping("layout")
    @LockCheck(checkType = LockCheck.CheckType.dashboard)
    public void editLayout(@RequestBody Dashboard dashboard) {
        dashboardService.updateLayout(dashboard);
    }

    /**
     * 获取仪表盘列表
     * @param appId 应用ID，若不传则获取所有仪表盘
     * @return 仪表盘简要视图列表
     */
    @GetMapping("list")
    public List<DashboardSimpleVO> list(@RequestParam(value = "appId", required = false) Long appId) {
        return dashboardService.listByAppId(appId);
    }

    /**
     * 获取当前仪表盘下的图表组列表
     * @param dashboardId 仪表盘ID
     * @return 图表组视图列表
     */
    @GetMapping("group/list")
    public List<ChartGroupVO> groupList(@RequestParam("dashboardId") Long dashboardId) {
        return dashboardService.getGroups(dashboardId);
    }
}
