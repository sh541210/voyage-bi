package top.fusb.voyagebi.persist.mapper;


import org.example.server.mybatis.BaseMapper;
import top.fusb.bi.data.base.domin.DatasourceType;
import top.fusb.voyagebi.domain.DatasourceCfg;
import top.fusb.voyagebi.domain.DatasourceCfgStore;
import top.fusb.voyagebi.persist.entity.Datasource;
import top.fusb.voyagebi.web.resource.node.persist.FileTreeNode;
import top.fusb.voyagebi.web.resource.node.service.IFileNodeBizService;

import java.util.Map;

import static org.example.server.web.utils.BeanUtils.aToBIgnoreId;

public interface DatasourceMapper extends BaseMapper<Datasource>, IFileNodeBizService {
    @Override
    default void update(Long id, String name, String description) {
        updateById(id, i -> i.set(Datasource::getName, name)
                .set(Datasource::getDescription, description));
    }

    @Override
    default String bizName() {
        return "datasource";
    }


    @Override
    default void create(FileTreeNode node, Map<String, Object> extraFields) {
        node.setBizRefId(insertRt(aToBIgnoreId(node, Datasource.class, (a, b) -> {
            b.setType(DatasourceType.valueOf(node.getBizTypeExtra()));
            DatasourceCfgStore store = new DatasourceCfgStore();
            store.setData(Map.of("default", new DatasourceCfg()));
            b.setCfgStore(store);
        })).getId());
    }
}
