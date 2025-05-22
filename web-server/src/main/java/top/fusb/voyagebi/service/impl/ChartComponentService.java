package top.fusb.voyagebi.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.server.web.ErrorCode;
import org.example.server.web.exception.BizException;
import org.springframework.stereotype.Service;
import top.fusb.voyagebi.domain.VO.ChartComponentSimpleVO;
import top.fusb.voyagebi.domain.VO.ChartComponentVO;
import top.fusb.voyagebi.domain.request.ChartComponentForm;
import top.fusb.voyagebi.persist.entity.ChartComponent;
import top.fusb.voyagebi.persist.mapper.ChartComponentMapper;

import java.util.List;

import static org.example.server.web.utils.BeanUtils.aToB;
import static org.example.server.web.utils.BeanUtils.listAToListB;

@Service
@RequiredArgsConstructor
public class ChartComponentService {
    private final ChartComponentMapper componentMapper;

    public List<ChartComponentVO> list() {
        return listAToListB(componentMapper.selectAll(), ChartComponentVO.class);
    }

    public void modify(ChartComponentForm form) {
        componentMapper.updateById(checkForm(form));
    }

    public Long create(ChartComponentForm form) {
        form.setEnabled(true);
        ChartComponent component = componentMapper.insertRt(checkForm(form));
        return component.getId();
    }

    public ChartComponent checkForm(ChartComponentForm form) {
        form.setCode(form.getCode().toUpperCase());
        ChartComponent component = aToB(form, ChartComponent.class);
        componentMapper.checkUniqueThrow(component, ChartComponent::getCode,
                () -> new BizException(ErrorCode.define("图表组件CODE重复")));
        componentMapper.checkUniqueThrow(component, ChartComponent::getName,
                () -> new BizException(ErrorCode.define("图表组件名称重复")));
        return component;
    }

    public List<ChartComponentSimpleVO> simpleList() {
        return listAToListB(componentMapper.selectAll(), ChartComponentSimpleVO.class);
    }

    public ChartComponentVO getOne(Long id) {
        return aToB(componentMapper.selectById(id), ChartComponentVO.class);
    }
}
