package top.fusb.voyagebi.controller;

import lombok.RequiredArgsConstructor;
import org.example.server.web.annotation.ResultController;
import org.example.server.web.annotation.TokenAccessible;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import top.fusb.voyagebi.domain.ClientAccessible;
import top.fusb.voyagebi.domain.VO.*;
import top.fusb.voyagebi.domain.request.DashboardShareForm;
import top.fusb.voyagebi.service.DashboardService;
import top.fusb.voyagebi.service.DashboardShareService;
import top.fusb.voyagebi.service.ShareTokenService;

import java.util.List;
import java.util.Map;

/**
 * 仪表盘分享控制器，处理与仪表盘分享相关的API请求
 */
@ResultController("api/dashboard/share")
@RequiredArgsConstructor
public class DashboardShareController {
    private final DashboardService dashboardService;
    private final DashboardShareService dashboardShareService;
    private final ShareTokenService shareTokenService;

    /**
     * 获取分享仪表盘列表
     * @param dashboardId 仪表盘ID，若不传则获取所有分享仪表盘
     * @param appId 应用ID，若不传则获取所有分享仪表盘
     * @return 分享仪表盘视图列表
     */
    @GetMapping("list")
    @TokenAccessible
    @ClientAccessible
    public List<DashboardShareVO> shareList(@RequestParam(value = "dashboardId", required = false) Long dashboardId,
                                            @RequestParam(value = "appId", required = false) Long appId) {
        return dashboardShareService.getShareList(dashboardId, appId);
    }

    /**
     * 更新分享仪表盘
     * @param param 仪表盘分享表单
     */
    @PutMapping
    public void updateShare(@RequestBody @Validated DashboardShareForm param) {
        dashboardShareService.updateShare(param);
    }

    /**
     * 创建分享仪表盘
     * @param param 仪表盘分享表单
     */
    @PostMapping
    public void createShare(@RequestBody @Validated DashboardShareForm param) {
        dashboardShareService.createShare(param);
    }

    /**
     * 根据指定的键获取仪表盘信息
     * @param keys 键集合
     * @return 仪表盘简要视图的键值对
     */
    @GetMapping("info")
    @TokenAccessible
    @ClientAccessible
    public Map<String, DashboardSimpleVO> getInfoListByKeys(@RequestParam("keys") String keys) {
        return dashboardShareService.getInfoListByKeys(keys);
    }

    /**
     * 根据键获取仪表盘快照列表
     * @param keys 键集合
     * @return 仪表盘快照视图列表
     */
    @TokenAccessible
    @GetMapping("snapshot/list")
    public List<DashboardSnapshotVO> getListByKeys(@RequestParam("keys") String keys) {
        return dashboardShareService.getDashboardShareListByKeys(keys);
    }

    /**
     * 根据键获取分享仪表盘的快照
     * @param key 分享仪表盘的键
     * @return 分享仪表盘的快照视图
     */
    @TokenAccessible
    @GetMapping
    public DashboardSnapshotVO getByKey(@RequestParam("key") String key) {
        List<DashboardSnapshotVO> shares = getListByKeys(key);
        return shares.get(0);
    }

    /**
     * 设置仪表盘分享的启用状态
     * @param id 分享仪表盘ID
     * @param enabled 是否启用
     */
    @PutMapping("enable")
    public void setEnable(@RequestParam("id") Long id, @RequestParam("enabled") Boolean enabled) {
        dashboardShareService.setEnabled(id, enabled);
    }

    /**
     * 删除分享的仪表盘
     * @param id 分享仪表盘ID
     */
    @DeleteMapping
    public void removeShare(@RequestParam("id") Long id) {
        dashboardShareService.removeShare(id);
    }

    /**
     * 生成token
     * @param key 分享key
     * @return token
     */
    @PostMapping("token")
    @TokenAccessible
    @ClientAccessible
    public String generateToken(@RequestParam("key") String key) {
        dashboardShareService.existShare(key);
        return shareTokenService.generateToken(key);
    }
}
