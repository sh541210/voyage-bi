package top.fusb.voyagebi.controller;

import lombok.RequiredArgsConstructor;
import org.example.server.web.annotation.ResultController;
import org.example.server.web.annotation.TokenAccessible;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import top.fusb.voyagebi.domain.VO.ChartComponentSimpleVO;
import top.fusb.voyagebi.domain.VO.ChartComponentVO;
import top.fusb.voyagebi.domain.request.ChartComponentForm;
import top.fusb.voyagebi.service.impl.ChartComponentService;

import java.util.List;

/**
 * 图表组件控制器，处理与图表组件相关的API请求
 */
@ResultController("api/chart/component")
@RequiredArgsConstructor
public class ChartComponentController {
    private final ChartComponentService componentService;

    /**
     * 获取图表组件列表
     * @return 图表组件列表
     */
    @GetMapping("list")
    @TokenAccessible
    public List<ChartComponentVO> list() {
        return componentService.list();
    }

    /**
     * 获取图表组件列表
     * @return 图表组件列表
     */
    @GetMapping("list/simple")
    @TokenAccessible
    public List<ChartComponentSimpleVO> simpleList() {
        return componentService.simpleList();
    }

    @GetMapping
    public ChartComponentVO getOne(@RequestParam("id") Long id) {
        return componentService.getOne(id);
    }

    /**
     * 修改图表组件
     * @param form 图表组件表单对象
     */
    @PutMapping
    public void modify(@RequestBody @Validated ChartComponentForm form) {
        componentService.modify(form);
    }

    /**
     * 创建图表组件
     * @param form 图表组件表单对象
     */
    @PostMapping
    public Long create(@RequestBody @Validated ChartComponentForm form) {
        return componentService.create(form);
    }
}
