package top.fusb.voyagebi.controller;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.server.web.annotation.ResultController;
import org.example.server.web.annotation.TokenAccessible;
import org.example.server.web.utils.WebUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import top.fusb.voyagebi.domain.ClientAccessible;
import top.fusb.voyagebi.domain.VO.ChartLabel;
import top.fusb.voyagebi.domain.VO.ChartVO;
import top.fusb.voyagebi.domain.VO.DataResult;
import top.fusb.voyagebi.domain.request.ChartDataRequest;
import top.fusb.voyagebi.domain.request.ChartGroupForm;
import top.fusb.voyagebi.persist.entity.Chart;
import top.fusb.voyagebi.persist.mapper.ChartMapper;
import top.fusb.voyagebi.service.impl.ChartService;

import java.util.List;

import static org.example.server.web.utils.BeanUtils.aToB;


/**
 * 图表控制器，处理与图表相关的API请求
 */
@ResultController("/api/chart")
@RequiredArgsConstructor
@Slf4j
public class ChartController {
    private final ChartMapper chartMapper;
    private final ChartService chartService;

    /**
     * 删除图表
     *
     * @param id 图表ID
     */
    @DeleteMapping
    public void removeChart(@RequestParam("id") Long id) {
        chartService.removeChart(id);
    }

    /**
     * 获取图表列表
     *
     * @param dashboardId 可选的dashboardId
     * @return 图表列表
     */
    @GetMapping("list")
    public List<ChartVO> chartList(@RequestParam(value = "dashboardId", required = false) Long dashboardId) {
        return chartService.getChartVOList(dashboardId);
    }

    /**
     * 获取图表名称和ID列表
     *
     * @param dashboardId 可选的dashboardId
     * @return 图表名称和ID列表
     */
    @GetMapping("list/label")
    public List<ChartLabel> chartLabelList(@RequestParam(value = "dashboardId", required = false) Long dashboardId) {
        return chartService.chartLabelList(dashboardId);
    }

    /**
     * 根据ID获取图表
     *
     * @param id 图表ID
     * @return 图表VO对象
     */
    @GetMapping
    public ChartVO chart(@RequestParam("id") Long id) {
        return chartService.getChart(id);
    }

    /**
     * 创建图表
     *
     * @param chartVO 图表VO对象
     * @return 新创建图表的ID
     */
    @PostMapping
    public Long create(@RequestBody ChartVO chartVO) {
        return chartService.createChart(chartVO);
    }

    /**
     * 获取图表名称
     *
     * @param chartId 图表ID
     * @return 图表名称
     */
    @GetMapping("name")
    @TokenAccessible
    @ClientAccessible
    public String getChartName(@RequestParam("chartId") Long chartId) {
        return chartService.getName(chartId);
    }

    /**
     * 复制图表
     *
     * @param chartId 图表ID
     * @return 复制图表的ID
     */
    @PostMapping("copy")
    public long copyChart(@RequestParam("chartId") Long chartId) {
        return chartService.copyChart(chartId);
    }

    /**
     * 编辑图表
     *
     * @param chartVO 图表VO对象
     */
    @PutMapping
    public void edit(@RequestBody ChartVO chartVO) {
        Chart chart = aToB(chartVO, Chart.class);
        chartMapper.updateById(chart);
    }

    /**
     * 更新图表样式
     *
     * @param form 图表VO对象
     */
    @PutMapping("style")
    public void updateStyle(@RequestBody ChartVO form) {
        Chart chart = new Chart();
        chart.setId(form.getId());
        chart.setStyleCfg(form.getStyleCfg());
        chartMapper.updateById(chart);
    }

    /**
     * 修改图表所属数据表
     *
     * @param chartId     图表ID
     * @param dataSheetId 数据表ID
     */
    @PutMapping("sheet/{chartId}/{sheetId}")
    public void changeSheet(@PathVariable("chartId") Long chartId,
                            @PathVariable("sheetId") Long dataSheetId) {
        chartService.changeSheet(chartId, dataSheetId);
    }

    /**
     * 获取图表数据
     *
     * @param dataRequest 图表数据请求对象
     * @return 图表数据结果
     */
//    @PostMapping("data/v2")
//    @TokenAccessible
//    public DataResult fetchData(@RequestBody ChartDataRequest dataRequest) {
//        return chartService.fetchData(dataRequest, null);
//    }

    /**
     * 获取图表数据总量
     *
     * @param dataRequest 图表数据请求对象
     * @return 图表数据总量
     */
    @TokenAccessible
    @PostMapping("data/count")
    @Deprecated
    public int fetchDataCount(@RequestBody ChartDataRequest dataRequest) {
        dataRequest.setCalcCount(true);
        DataResult result = chartService.fetchData(dataRequest);
        if (result.isSuccess()) {
            Object value = result.getData().getOne();
            if (value != null) return Integer.parseInt(value.toString());
        }
        return 0;
    }

    /**
     * 导出图表数据
     *
     * @param dataRequest 图表数据请求对象
     * @param response    HTTP响应对象
     */
    @PostMapping("data/export")
    @TokenAccessible
    public void exportChartData(@RequestBody ChartDataRequest dataRequest, HttpServletResponse response) {
        DataResult dataResult = chartService.fetchData(dataRequest);
        WebUtils.export(response, dataResult.toMapList(),
                "export", "xlsx");
    }

    /**
     * 编辑图表组
     *
     * @param chartGroupForm 图表组表单对象
     * @return 更新后的图表组ID
     */
    @PutMapping("group")
    public Long modifyGroup(@RequestBody @Validated ChartGroupForm chartGroupForm) {
        return chartService.saveChartGroup(chartGroupForm);
    }

    /**
     * 创建图表组
     *
     * @param chartGroupForm 图表组表单对象
     * @return 新创建的图表组ID
     */
    @PostMapping("group")
    public Long createGroup(@RequestBody @Validated ChartGroupForm chartGroupForm) {
        chartGroupForm.setId(null);
        return chartService.saveChartGroup(chartGroupForm);
    }

    /**
     * 删除图表组
     *
     * @param groupId 图表组ID
     */
    @DeleteMapping("group")
    public void removeGroup(@RequestParam("groupId") Long groupId) {
        chartService.removeGroup(groupId);
    }

    /**
     * 更新图表组样式
     *
     * @param chartGroupForm 图表组表单对象
     */
    @PutMapping("group/style")
    public void updateGroupStyle(@RequestBody ChartGroupForm chartGroupForm) {
        chartService.updateChartGroupStyle(chartGroupForm);
    }
}
