package top.fusb.voyagebi.controller;

import lombok.RequiredArgsConstructor;
import org.example.server.web.annotation.ResultController;
import org.springframework.web.bind.annotation.*;
import top.fusb.bi.data.base.domin.DatasourceType;
import top.fusb.voyagebi.domain.DatasourceCfg;
import top.fusb.voyagebi.domain.DatasourceCfgStore;
import top.fusb.voyagebi.domain.request.DatasourceCfgModifyRequest;
import top.fusb.voyagebi.domain.request.DatasourceForm;
import top.fusb.voyagebi.persist.entity.Datasource;
import top.fusb.voyagebi.persist.mapper.DatasourceMapper;
import top.fusb.voyagebi.service.manager.DataClientManager;
import top.fusb.voyagebi.web.resource.node.domain.BizType;
import top.fusb.voyagebi.web.resource.node.domain.annotation.FileNodeUpdate;
import top.fusb.voyagebi.web.resource.node.domain.annotation.LockCheck;

import java.util.List;

import static org.example.server.web.utils.BeanUtils.aToB;

/**
 * 数据源控制器，处理与数据源相关的API请求
 */
@ResultController("api/datasource")
@RequiredArgsConstructor
public class DatasourceController {
    private final DatasourceMapper datasourceMapper;
    private final DataClientManager dataClientManager;

    /**
     * 根据ID获取数据源
     * @param id 数据源ID
     * @return 数据源对象
     */
    @GetMapping
    public Datasource get(@RequestParam("id") Long id) {
        return datasourceMapper.selectById(id);
    }

    /**
     * 获取所有数据源
     * @return 数据源列表
     */
    @GetMapping("list")
    public List<Datasource> list() {
        return datasourceMapper.selectAll();
    }

    /**
     * 检查数据源的连通性
     * @param datasourceCfg 数据源配置
     * @param datasourceType 数据源类型
     * @return 是否可以连接成功
     */
    @PostMapping("checkConnect")
    public boolean checkConnect(@RequestBody DatasourceCfg datasourceCfg,
                                @RequestParam("datasourceType") String datasourceType) {
        return dataClientManager.getDataClient(DatasourceType.valueOf(datasourceType), datasourceCfg).testConnection();
    }

    @PutMapping
    @FileNodeUpdate(bizType = BizType.DATASOURCE)
    @LockCheck(checkType = LockCheck.CheckType.datasource)
    public void modifyDatasource(@RequestBody DatasourceForm form) {
        datasourceMapper.updateById(aToB(form, Datasource.class));
    }

    @PutMapping("cfg")
    @FileNodeUpdate(bizType = BizType.DATASOURCE)
    @LockCheck(checkType = LockCheck.CheckType.datasource)
    public void modifyDatasourceCfg(@RequestBody DatasourceCfgModifyRequest request) {
        Datasource ds = datasourceMapper.selectById(request);
        DatasourceCfgStore cfgStore = ds.getCfgStore();
        cfgStore.updateCfg(request.getEnv(), aToB(request, DatasourceCfg.class));
        datasourceMapper.updateById(ds);
    }
}