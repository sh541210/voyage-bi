package top.fusb.bi.data.jdbc.client;

import top.fusb.bi.data.base.domin.DatasourceType;
import top.fusb.bi.data.jdbc.domain.RdsParam;

public class SelectDBDataClient extends JdbcDataClient {
    public SelectDBDataClient(int parallelism, RdsParam param) {
        super(parallelism, param);
    }

    @Override
    public DatasourceType getDsType() {
        return DatasourceType.SelectDB;
    }
}
