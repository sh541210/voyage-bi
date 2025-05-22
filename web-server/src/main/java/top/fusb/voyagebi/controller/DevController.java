package top.fusb.voyagebi.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import lombok.RequiredArgsConstructor;
import org.example.server.web.annotation.ResultController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import top.fusb.voyagebi.domain.VO.DataResult;
import top.fusb.voyagebi.domain.request.SqlQueryRequest;
import top.fusb.voyagebi.service.impl.DevService;

/**
 * 开发工具API控制器，提供开发相关的操作接口
 */
@ResultController("/api/dev")
@RequiredArgsConstructor
public class DevController {
    private final DevService devService;

    /**
     * 执行SQL查询操作，返回查询结果
     *
     * @param queryRequest 包含SQL查询文本及查询参数的请求对象
     * @return 查询结果数据
     */
    @SaIgnore
    @PostMapping("query")
    public DataResult query(@RequestBody SqlQueryRequest queryRequest) {
        return devService.queryForDataResult(queryRequest);
    }
}
