package top.fusb.voyagebi.controller;

import lombok.RequiredArgsConstructor;
import org.example.server.web.annotation.ResultController;
import org.example.server.web.utils.LoginUtils;
import org.springframework.web.bind.annotation.GetMapping;
import top.fusb.voyagebi.domain.FileBizTypes;
import top.fusb.voyagebi.domain.VO.HomeCenterDataVO;
import top.fusb.voyagebi.domain.request.FileTreeNodeVO;
import top.fusb.voyagebi.service.IFileTreeNodeService;

import java.util.List;

@ResultController("api/home-center/")
@RequiredArgsConstructor
public class HomeCenterController {
    private final IFileTreeNodeService fileTreeNodeService;

    @GetMapping("data")
    public HomeCenterDataVO getHomeCenterData() {
        Long userId = LoginUtils.getUserId();
        List<FileTreeNodeVO> nodes = fileTreeNodeService.getNodesByCreateBy(userId);
        long dataSheetCount = nodes.stream().filter(i -> i.getBizType().equals(FileBizTypes.DATA_SHEET)).count();
        long datasourceCount = nodes.stream().filter(i -> i.getBizType().equals(FileBizTypes.DATASOURCE)).count();
        long dashboardCount = nodes.stream().filter(i -> i.getBizType().equals(FileBizTypes.DASHBOARD)).count();
        HomeCenterDataVO data = new HomeCenterDataVO();
        data.setDataSheetCount(dataSheetCount);
        data.setDatasourceCount(datasourceCount);
        data.setDashboardCount(dashboardCount);
        return data;
    }
}
