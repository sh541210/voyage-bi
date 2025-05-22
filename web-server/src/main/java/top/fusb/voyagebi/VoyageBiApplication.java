package top.fusb.voyagebi;

import org.example.server.user.annotation.EnableUserModule;
import org.example.server.web.annotation.EnableWebResult;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Import;
import top.fusb.voyagebi.config.CorsConfig;
import top.fusb.voyagebi.config.WebConfig;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@SpringBootApplication
@EnableCaching
@MapperScan(basePackages = {"top.fusb.**.mapper"})
@Import({WebConfig.class, CorsConfig.class})
@EnableWebResult
@EnableUserModule
public class VoyageBiApplication {

    public static void main(String[] args) {
        SpringApplication.run(VoyageBiApplication.class, args);
        System.out.println("---------------------------- " +
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd hh:mm:ss")) +
                " 至 此 服 务 已 顺 利 启 动  🎉 🎉 🎉----------------------------");
    }

}
