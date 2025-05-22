package top.fusb.voyagebi.persist.mapper;

import org.example.server.mybatis.BaseMapper;
import top.fusb.voyagebi.domain.DashboardCfg;
import top.fusb.voyagebi.domain.enums.DashboardType;
import top.fusb.voyagebi.domain.request.DashboardEditForm;
import top.fusb.voyagebi.persist.entity.Dashboard;
import top.fusb.voyagebi.persist.entity.FileTreeNode;
import top.fusb.voyagebi.service.IFileNodeBizService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.example.server.web.utils.BeanUtils.aToB;
import static org.example.server.web.utils.BeanUtils.aToBIgnoreId;

public interface DashboardMapper extends BaseMapper<Dashboard>, IFileNodeBizService {
    default Map<Long, List<Dashboard>> getListMapInAppIds(List<Long> appIds) {
        if (appIds.isEmpty()) {
            return Map.of();
        }
        return selectList(i -> i.select(Dashboard::getId, Dashboard::getDescription,
                        Dashboard::getType, Dashboard::getAppId,
                        Dashboard::getName)
                .in(Dashboard::getAppId, appIds))
                .stream().collect(Collectors.groupingBy(Dashboard::getAppId));
    }

    @Override
    default void update(Long id, String name, String description) {
        updateById(id, i -> i.set(Dashboard::getName, name)
                .set(Dashboard::getDescription, description));
    }

    @Override
    default String bizName() {
        return "dashboard";
    }

    @Override
    default void create(FileTreeNode node, Map<String, Object> extraFields) {
        Dashboard dashboard = create(aToB(node, DashboardEditForm.class, (a, b) -> {
            b.setType(DashboardType.valueOf(node.getBizTypeExtra()));
        }));
        node.setBizRefId(dashboard.getId());
    }

    default Dashboard create(DashboardEditForm form) {
        return insertRt(aToBIgnoreId(form, Dashboard.class, (a, b) -> {
            b.setCfg(new DashboardCfg());
            b.setStyleCfg(new HashMap<>());
            b.setLayoutCfg(Map.of("pc", List.of()));
        }));
    }
}
