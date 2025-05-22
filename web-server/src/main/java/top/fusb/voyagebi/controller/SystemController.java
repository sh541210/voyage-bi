package top.fusb.voyagebi.controller;

import lombok.RequiredArgsConstructor;
import org.example.server.web.annotation.ResultController;
import org.example.server.web.annotation.TokenAccessible;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import top.fusb.voyagebi.domain.request.SystemConfigValueForm;
import top.fusb.voyagebi.service.SystemConfigService;

import java.util.Map;

@ResultController("/api/system")
@RequiredArgsConstructor
public class SystemController {
    private final SystemConfigService systemConfigService;

    /**
     * 修改配置
     * @param form 表单
     */
    @PutMapping("/config/value")
    public void modifySystemConfig(@RequestBody SystemConfigValueForm form) {
        systemConfigService.modify(form);
    }

    /**
     * 获取配置
     * @return 配置
     */
    @GetMapping("/config/values")
    @TokenAccessible
    public Map<String,Object> getSystemConfigValues() {
        return systemConfigService.getSystemConfigValues();
    }
}
