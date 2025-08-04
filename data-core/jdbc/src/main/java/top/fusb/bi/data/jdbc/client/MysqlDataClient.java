package top.fusb.bi.data.jdbc.client;

import lombok.extern.slf4j.Slf4j;
import top.fusb.bi.data.base.domin.DatasourceType;
import top.fusb.bi.data.jdbc.domain.RdsParam;

@Slf4j
public class MysqlDataClient extends JdbcDataClient {
    public MysqlDataClient(int parallelism, RdsParam param) {
        super(parallelism, param);
        setDefaultConnectionParams();
    }

    private void setDefaultConnectionParams() {
        String sessionVariables = param.getParams().get("sessionVariables");
        if (param.getVersion() != null && !param.getVersion().startsWith("5")) {
            if (sessionVariables == null) {
                sessionVariables = "";
            }
            sessionVariables += "information_schema_stats_expiry=0";
            param.getParams().put("sessionVariables", sessionVariables);
        }
    }

    @Override
    public DatasourceType getDsType() {
        return DatasourceType.MySQL;
    }
}
