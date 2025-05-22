package top.fusb.voyagebi.service;

import top.fusb.voyagebi.domain.VO.DashboardShareVO;
import top.fusb.voyagebi.domain.VO.DashboardSimpleVO;
import top.fusb.voyagebi.domain.VO.DashboardSnapshotVO;
import top.fusb.voyagebi.domain.request.DashboardShareForm;
import top.fusb.voyagebi.persist.entity.DashboardShare;

import java.util.List;
import java.util.Map;

public interface DashboardShareService {
    /**
     * 转换成分享的仪表盘
     *
     * @param param 生成参数
     * @return 分享的仪表盘对象
     */
    DashboardShare toShare(DashboardShareForm param);

    void createShare(DashboardShareForm param);

    void updateShare(DashboardShareForm param);

    void setEnabled(Long id, Boolean enabled);

    List<DashboardShareVO> getShareList(Long dashboardId, Long appId);

    Map<String, DashboardSimpleVO> getInfoListByKeys(String keys);

    void existShare(String key);

    List<DashboardSnapshotVO> getDashboardShareListByKeys(String keys);

    void removeShare(Long id);
}
