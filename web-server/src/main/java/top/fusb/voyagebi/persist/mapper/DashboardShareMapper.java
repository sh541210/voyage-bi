package top.fusb.voyagebi.persist.mapper;

import org.example.server.mybatis.BaseMapper;
import top.fusb.voyagebi.persist.entity.DashboardShare;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public interface DashboardShareMapper extends BaseMapper<DashboardShare> {
    default Map<Long, List<DashboardShare>> getListMapInAppIds(List<Long> appIds) {
        if (appIds.isEmpty()) {
            return Map.of();
        }
        return selectList(i -> i.select(DashboardShare::getId, DashboardShare::getEnabled,
                        DashboardShare::getDashboardId, DashboardShare::getKey,
                        DashboardShare::getType, DashboardShare::getAppId,
                        DashboardShare::getName)
                .in(DashboardShare::getAppId, appIds))
                .stream().collect(Collectors.groupingBy(DashboardShare::getAppId));
    }
}
