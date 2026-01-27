package top.fusb.voyagebi.controller;

import lombok.RequiredArgsConstructor;
import org.example.server.web.annotation.ResultController;
import org.example.server.web.annotation.TokenAccessible;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import top.fusb.voyagebi.domain.VO.*;
import top.fusb.voyagebi.domain.request.DataSheetColumnForm;
import top.fusb.voyagebi.domain.request.SheetDataGetParam;
import top.fusb.voyagebi.persist.entity.DataSheet;
import top.fusb.voyagebi.service.impl.DataSheetServiceImpl;
import top.fusb.voyagebi.web.resource.node.domain.RequestType;
import top.fusb.voyagebi.web.resource.node.domain.annotation.LockCheck;

import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.example.server.web.utils.BeanUtils.listAToListB;

/**
 * 数据集控制器，处理与数据集相关的API请求
 */
@ResultController("/api/data-sheet")
@RequiredArgsConstructor
public class DataSheetController {
    private final DataSheetServiceImpl dataSheetService;

    /**
     * 创建数据集
     *
     * @param dataSheet 数据集对象
     * @return 创建的数据集ID
     */
    @PostMapping
    public Long create(@RequestBody DataSheet dataSheet) {
        return dataSheetService.create(dataSheet);
    }

    /**
     * 根据ID获取数据集
     *
     * @param id 数据集ID
     * @return 数据集视图对象
     */
    @GetMapping
    public DataSheetVO get(@RequestParam("id") Long id) {
        return dataSheetService.get(id);
    }

    /**
     * 获取数据集的v2版本数据
     *
     * @param param 查询数据参数
     * @return 数据结果
     */
    @TokenAccessible
    @PostMapping("data/v2")
    public DataResult getSheetDataV2(@RequestBody SheetDataGetParam param) {
        return dataSheetService.getData(param);
    }

    @TokenAccessible
    @PostMapping("data")
    public List<Map<String, Object>> getSheetData(@RequestBody SheetDataGetParam param) {
        return dataSheetService.getData(param).toMapList();
    }

    /**
     * 更新数据集字段
     *
     * @param form 数据集字段表单
     */
    @PutMapping("column")
    @LockCheck(checkType = LockCheck.CheckType.dataSheet)
    public void updateColumn(@RequestBody @Validated DataSheetColumnForm form) {
        dataSheetService.updateColumn(form);
    }

    /**
     * 获取指定数据集列的所有值
     *
     * @param dataSheetId 数据集ID
     * @param columnId    列ID
     * @return 数据集列的值集合
     */
    @GetMapping("column/values")
    public Set<Object> getColumnValues(@RequestParam("dataSheetId") Long dataSheetId,
                                       @RequestParam("columnId") Long columnId) {
        return dataSheetService.getColumnValues(dataSheetId, columnId);
    }

    /**
     * 修改数据集字段结构
     *
     * @param dataSheetId 数据集ID
     */
    @PutMapping("columns")
    @LockCheck(checkType = LockCheck.CheckType.dataSheet,
            requestType = RequestType.PARAMS,
            idName = "dataSheetId")
    public void updateColumns(@RequestParam("dataSheetId") Long dataSheetId) {
        dataSheetService.updateColumns(dataSheetId);
    }

    /**
     * 修改数据集信息
     *
     * @param form 数据集表单
     */
    @PutMapping
    @LockCheck(checkType = LockCheck.CheckType.dataSheet)
    public void modify(@RequestBody DataSheet form) {
        dataSheetService.modify(form);
    }

    /**
     * 获取数据集列表
     *
     * @return 数据集视图对象列表
     */
    @GetMapping("list")
    public List<DataSheetVO> list() {
        return dataSheetService.list();
    }

    /**
     * 获取简化版的数据集列表
     *
     * @return 简化的数据集对象列表
     */
    @GetMapping("list/simple")
    public List<DataSheet> listSimple() {
        return dataSheetService.listSimple();
    }

    /**
     * 获取数据集详细信息
     *
     * @param id 数据集ID
     * @return 数据集详细视图对象
     */
    @GetMapping("detail")
    public DataSheetDetailVO detail(@RequestParam("id") Long id) {
        return dataSheetService.getDetail(id);
    }

    /**
     * 获取指定数据集表结构字段列表
     *
     * @param dataSheetId 数据集ID
     * @return 数据集字段视图对象列表
     */
    @GetMapping("column/list")
    public List<DataSheetColumnVO> getColumns(@RequestParam("dataSheetId") Long dataSheetId) {
        return listAToListB(dataSheetService.getColumns(dataSheetId), DataSheetColumnVO.class);
    }

    /**
     * 获取简化版的数据集表结构字段列表
     *
     * @param dataSheetId 数据集ID
     * @return 简化的数据集字段视图对象列表
     */
    @GetMapping("column/list/simple")
    public List<DataSheetColumnSimpleVO> getColumnsSimple(@RequestParam("dataSheetId") Long dataSheetId) {
        return listAToListB(dataSheetService.getColumns(dataSheetId), DataSheetColumnSimpleVO.class);
    }
}
