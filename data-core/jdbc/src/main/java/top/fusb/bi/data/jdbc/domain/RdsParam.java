package top.fusb.bi.data.jdbc.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RdsParam implements Serializable {
    private String url;
    private String username;
    private String password;
    private Map<String, String> params = new HashMap<>();

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        RdsParam rdsParam = (RdsParam) o;
        return Objects.equals(url, rdsParam.url) && Objects.equals(username, rdsParam.username) && Objects.equals(password, rdsParam.password) && Objects.equals(params, rdsParam.params);
    }

    @Override
    public int hashCode() {
        return Objects.hash(url, username, password, params);
    }

    @Override
    public String toString() {
        return "RdsParam{" +
                "url='" + url + '\'' +
                ", username='" + username + '\'' +
                ", params=" + params +
                '}';
    }
}
