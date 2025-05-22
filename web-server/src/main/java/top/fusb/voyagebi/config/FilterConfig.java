package top.fusb.voyagebi.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Configuration
public class FilterConfig {
    @Bean
    public FilterRegistrationBean<Filter> requestBodyFilter() {
        FilterRegistrationBean<Filter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new Filter() {
            @Override
            public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
                //requestWrapper中保存着供二次使用的请求数据
                ServletRequest requestWrapper = null;
                if (request instanceof HttpServletRequest) {
                    requestWrapper = new RequestBodyWrapper((HttpServletRequest) request);
                }
                if(requestWrapper == null) {
                    chain.doFilter(request, response);
                } else {
                    chain.doFilter(requestWrapper, response);
                }
            }
            @Override
            public void destroy() {
            }
        });
        registrationBean.addUrlPatterns("/*");  // 设置过滤路径
        return registrationBean;
    }
}