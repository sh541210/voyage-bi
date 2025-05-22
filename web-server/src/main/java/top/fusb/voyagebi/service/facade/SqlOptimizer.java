package top.fusb.voyagebi.service.facade;

import net.sf.jsqlparser.statement.select.PlainSelect;
import top.fusb.bi.data.base.domin.DatasourceType;
import top.fusb.bi.data.base.parser.SelectHandler;

/**
 * SQL优化器
 */
public class SqlOptimizer implements SelectHandler {
    private final DatasourceType dsType;

    public SqlOptimizer(DatasourceType dsType) {
        this.dsType = dsType;
    }

    @Override
    public void handlePlainSelect(PlainSelect select) {
        // TODO AST SQL优化
    }
}
