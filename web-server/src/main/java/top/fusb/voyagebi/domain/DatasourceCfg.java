package top.fusb.voyagebi.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 数据源配置类，包含数据库连接的相关信息
 */
@AllArgsConstructor
@NoArgsConstructor
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class DatasourceCfg implements Serializable {

    /**
     * 数据库连接 URL
     * 该字段存储数据库连接的 URL 地址，例如：jdbc:mysql://localhost:3306/database
     */
    private String url;

    /**
     * 数据库用户名
     * 该字段存储用于连接数据库的用户名
     */
    private String username;

    /**
     * 数据库密码
     * 该字段存储用于连接数据库的密码
     */
    private String password;

    private String version;
}
