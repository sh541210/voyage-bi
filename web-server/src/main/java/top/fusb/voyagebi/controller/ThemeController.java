package top.fusb.voyagebi.controller;

import lombok.RequiredArgsConstructor;
import org.example.server.web.annotation.ResultController;
import org.example.server.web.annotation.TokenAccessible;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import top.fusb.voyagebi.domain.VO.ThemeVO;
import top.fusb.voyagebi.persist.entity.Theme;
import top.fusb.voyagebi.persist.mapper.ThemeMapper;

import java.util.HashMap;
import java.util.List;

import static org.example.server.web.utils.BeanUtils.aToB;
import static org.example.server.web.utils.BeanUtils.listAToListB;

/**
 * 主题控制器，处理与主题相关的请求
 */
@ResultController("api/theme")
@RequiredArgsConstructor
public class ThemeController {
    private final ThemeMapper themeMapper;

    /**
     * 创建主题
     * @param theme 主题信息
     * @return 创建的主题ID
     */
    @PostMapping
    public Long create(@RequestBody Theme theme) {
        theme.setDashboardStyleCfg(new HashMap<>());
        themeMapper.insert(theme);
        return theme.getId();
    }

    /**
     * 修改主题
     * @param theme 主题信息
     */
    @PutMapping
    public void modify(@RequestBody Theme theme) {
        themeMapper.updateById(theme);
    }

    /**
     * 根据ID获取主题
     * @param id 主题ID
     * @return 主题信息
     */
    @GetMapping
    public ThemeVO getTheme(Long id) {
        return aToB(themeMapper.selectById(id), ThemeVO.class);
    }

    /**
     * 获取主题列表
     * @return 主题信息列表
     */
    @TokenAccessible
    @GetMapping("list")
    public List<ThemeVO> getThemeList() {
        return listAToListB(themeMapper.selectList(i -> i.orderByDesc(Theme::getId)), ThemeVO.class);
    }
}
