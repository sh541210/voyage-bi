package top.fusb.voyagebi.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import org.springframework.stereotype.Controller;

/**
 * 首页控制器，处理首页请求
 */
@Controller
public class IndexController {

    /**
     * 返回首页视图
     * @return 首页视图名称
     */
    @SaIgnore
    public String index() {
        return "index";
    }
}
