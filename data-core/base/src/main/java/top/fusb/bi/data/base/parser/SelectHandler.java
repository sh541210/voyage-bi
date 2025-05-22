package top.fusb.bi.data.base.parser;

import net.sf.jsqlparser.expression.Expression;
import net.sf.jsqlparser.statement.select.PlainSelect;

public interface SelectHandler {
    default Expression handleExpression(Expression expression) {
        return expression;
    }

    default void handlePlainSelect(PlainSelect select) {

    }
}
