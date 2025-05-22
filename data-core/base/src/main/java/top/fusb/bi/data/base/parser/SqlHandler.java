package top.fusb.bi.data.base.parser;

import net.sf.jsqlparser.JSQLParserException;

public interface SqlHandler {
    String handleSQL(String sql) throws JSQLParserException;
}
