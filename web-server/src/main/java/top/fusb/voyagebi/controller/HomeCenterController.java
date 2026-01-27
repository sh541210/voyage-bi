package top.fusb.voyagebi.controller;

import lombok.RequiredArgsConstructor;
import org.example.server.web.annotation.ResultController;
import org.springframework.web.bind.annotation.GetMapping;
import top.fusb.voyagebi.domain.VO.HomeCenterDataVO;
import top.fusb.voyagebi.web.resource.node.domain.BizType;
import top.fusb.voyagebi.web.resource.node.domain.FileTreeNodeVO;
import top.fusb.voyagebi.web.resource.node.service.IFileTreeNodeService;

import java.util.List;

@ResultController("api/home-center/")
@RequiredArgsConstructor
public class HomeCenterController {
    private final IFileTreeNodeService fileTreeNodeService;

    @GetMapping("data")
    public HomeCenterDataVO getHomeCenterData() {
        List<FileTreeNodeVO> nodes = fileTreeNodeService.getNodesByCreateBy();
        long dataSheetCount = nodes.stream().filter(i -> i.getBizType().equals(BizType.DATA_SHEET.name())).count();
        long datasourceCount = nodes.stream().filter(i -> i.getBizType().equals(BizType.DATASOURCE.name())).count();
        long dashboardCount = nodes.stream().filter(i -> i.getBizType().equals(BizType.DASHBOARD.name())).count();
        HomeCenterDataVO data = new HomeCenterDataVO();
        data.setDataSheetCount(dataSheetCount);
        data.setDatasourceCount(datasourceCount);
        data.setDashboardCount(dashboardCount);
        return data;
    }
}
