package top.fusb.voyagebi.service;

import top.fusb.voyagebi.domain.request.SystemConfigValueForm;

import java.util.Map;

public interface SystemConfigService {
    void modify(SystemConfigValueForm form);

    Map<String, Object> getSystemConfigValues();
}
