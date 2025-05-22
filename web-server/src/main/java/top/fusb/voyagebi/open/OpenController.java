package top.fusb.voyagebi.open;

import cn.dev33.satoken.annotation.SaIgnore;
import top.fusb.voyagebi.domain.VO.DataResult;
import top.fusb.voyagebi.domain.request.ChartDataRequest;
import top.fusb.voyagebi.persist.entity.Chart;
import top.fusb.voyagebi.persist.entity.DashboardShare;
import top.fusb.voyagebi.persist.mapper.ChartMapper;
import top.fusb.voyagebi.persist.mapper.DashboardShareMapper;
import top.fusb.voyagebi.service.impl.ChartService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.example.server.web.ErrorCode;
import org.example.server.web.annotation.ResultController;
import org.example.server.web.exception.BizException;
import org.example.server.web.utils.WebUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import static org.example.server.web.utils.BeanUtils.aToB;

/**
 * 开放接口
 */
@ResultController("api/open")
@RequiredArgsConstructor
@SaIgnore
public class OpenController {
    private final DashboardShareMapper shareMapper;
    private final ChartService chartService;
    private final ChartMapper chartMapper;

    /**
     * 获取数据
     *
     * @param request api request
     * @return 响应
     */
    @PostMapping("data")
    @SaIgnore
    public ApiResponse fetchData(@RequestBody ApiRequest request) {
        DataResult dataResult = fetchData0(request);
        if (dataResult.isSuccess()) return aToB(dataResult.getData(), ApiResponse.class);
        throw new BizException(ErrorCode.define(-103, dataResult.getMessage()));
    }

    private DataResult fetchData0(ApiRequest request) {
        DashboardShare share = shareMapper.selectOne(i -> i.
                select(DashboardShare::getKey, DashboardShare::getDashboardId)
                .eq(DashboardShare::getName, request.getProjectName())
                .orderByDesc(DashboardShare::getAppId).last(" LIMIT 1"));
        if (share == null) throw new BizException(ErrorCode.define(-101, "Project not found"));
        Long chartId = chartMapper.selectValue(Chart::getId, i -> i
                .eq(Chart::getName, request.getApiName())
                .eq(Chart::getDashboardId, share.getDashboardId())
                .orderByDesc(Chart::getId).last(" LIMIT 1"));
        if (chartId == null) throw new BizException(ErrorCode.define(-102, "Api not found"));
        ChartDataRequest dataRequest = new ChartDataRequest();
        dataRequest.setShareKey(share.getKey());
        dataRequest.setEnv("default");
        dataRequest.setTotal(true);
        dataRequest.setChartId(chartId);
        dataRequest.setDataMode(ChartDataRequest.DataMode.REAL_TIME);
        dataRequest.setParameters(request.getParameters());
        dataRequest.setPagination(request.getPagination());
        return chartService.fetchData(dataRequest);
    }

    /**
     * 导出数据
     *
     * @param request  api request
     * @param response 响应对象
     */
    @PostMapping("data/export")
    @SaIgnore
    public void exportChartData(@RequestBody ApiRequest request, HttpServletResponse response) {
        DataResult dataResult = fetchData0(request);
        WebUtils.export(response, dataResult.toMapList(), "export", "xlsx");
    }
}
