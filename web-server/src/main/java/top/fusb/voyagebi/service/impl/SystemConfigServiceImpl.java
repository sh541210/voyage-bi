package top.fusb.voyagebi.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import top.fusb.voyagebi.domain.request.SystemConfigValueForm;
import top.fusb.voyagebi.persist.entity.SystemConfig;
import top.fusb.voyagebi.persist.mapper.SystemConfigMapper;
import top.fusb.voyagebi.service.SystemConfigService;

import java.util.Map;
import java.util.stream.Collectors;

import static org.example.server.web.utils.BeanUtils.aToB;

@Service
@RequiredArgsConstructor
public class SystemConfigServiceImpl implements SystemConfigService {
    private final SystemConfigMapper systemConfigMapper;

    @Override
    public void modify(SystemConfigValueForm form) {
        SystemConfig config = systemConfigMapper.selectOne(i ->
                i.eq(SystemConfig::getConfigKey, form.getConfigKey()));
        if (config != null) {
            config.setConfigValue(form.getValue());
            systemConfigMapper.updateById(config);
        } else {
            systemConfigMapper.insert(aToB(form, SystemConfig.class,
                    (a, b) -> {
                        b.setConfigValue(a.getValue());
                        b.setDataType("string");
                    }));
        }
    }

    @Override
    public Map<String, Object> getSystemConfigValues() {
        return systemConfigMapper.selectList(
                        i -> i.select(SystemConfig::getConfigValue, SystemConfig::getConfigKey))
                .stream().collect(Collectors.toMap(SystemConfig::getConfigKey, SystemConfig::getConfigValue));
    }
}
