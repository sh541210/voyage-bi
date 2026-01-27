package top.fusb.voyagebi.persist.mapper;

import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.example.server.mybatis.BaseMapper;
import top.fusb.bi.data.base.domin.DatasourceType;
import top.fusb.voyagebi.base.domain.utils.CacheManager;
import top.fusb.voyagebi.domain.DataSheetCfg;
import top.fusb.voyagebi.domain.enums.SheetType;
import top.fusb.voyagebi.persist.entity.DataSheet;
import top.fusb.voyagebi.web.resource.node.persist.FileTreeNode;
import top.fusb.voyagebi.web.resource.node.service.IFileNodeBizService;

import java.io.Serializable;
import java.time.Duration;
import java.util.Map;

import static org.example.server.web.utils.BeanUtils.aToBIgnoreId;

public interface DataSheetMapper extends BaseMapper<DataSheet>, IFileNodeBizService {
    CacheManager<DataSheet> manager = new CacheManager<>(Duration.ofSeconds(3));
    @Override
    default void update(Long id, String name, String description) {
        updateById(id, i -> i.set(DataSheet::getName, name)
                .set(DataSheet::getDescription, description));
    }

    default DataSheet getById(Serializable id) {
       return manager.get(id.toString(), false, i -> selectById(id));
    }

    @Override
    default String bizName() {
        return "dataSheet";
    }

    @Override
    default void create(FileTreeNode node, Map<String, Object> extraFields) {
        node.setBizRefId(insertRt(aToBIgnoreId(node, DataSheet.class, (a, b) -> {
            b.setSheetType(SheetType.valueOf(node.getBizTypeExtra()));
            b.setSqlText("");
            b.setCfg(new DataSheetCfg());
            b.setDatasourceId(Long.parseLong(extraFields.getOrDefault("datasourceId", 0).toString()));
        })).getId());
    }

    @Select("""
            SELECT `type` FROM bi_datasource d RIGHT JOIN bi_data_sheet s ON
            d.id = s.datasource_id WHERE s.id = #{dataSheetId}
            """)
    DatasourceType getDatasourceTypeById(@Param("dataSheetId") Long id);

    default Long getDatasourceIdById(Long id) {
        return selectValueById(DataSheet::getDatasourceId, id);
    }
}
