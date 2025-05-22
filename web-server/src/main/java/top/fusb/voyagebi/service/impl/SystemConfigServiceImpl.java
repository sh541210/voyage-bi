package top.fusb.voyagebi.service.impl;

import top.fusb.voyagebi.domain.request.SystemConfigValueForm;
import top.fusb.voyagebi.persist.entity.SystemConfig;
import top.fusb.voyagebi.persist.mapper.SystemConfigMapper;
import top.fusb.voyagebi.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SystemConfigServiceImpl implements SystemConfigService {
    private final SystemConfigMapper systemConfigMapper;

    @Override
    public void modify(SystemConfigValueForm form) {
        systemConfigMapper.updateBy(
                i->i.set(SystemConfig::getConfigValue, form.getValue())
                .eq(SystemConfig::getConfigKey, form.getConfigKey()));
    }

    @Override
    public Map<String, Object> getSystemConfigValues() {
        return systemConfigMapper.selectList(i->i.select(SystemConfig::getConfigValue, SystemConfig::getConfigKey))
                .stream().collect(Collectors.toMap(SystemConfig::getConfigKey, SystemConfig::getConfigValue));
    }
}
