package top.fusb.bi.data.base.utils;

import junit.framework.TestCase;

import java.util.HashMap;
import java.util.Map;

import static top.fusb.bi.data.base.utils.DynamicBlocks.processDynamicBlocks;

public class DynamicBlocksTest extends TestCase {

    public void test1() {
        var sql = """
                SELECT\s
                !{
                    @if(值字段=="购入价格") price as `value`
                    @elif(值字段=="品牌") brand as `value`
                    @else price2 as `value`
                }!,

                 `status`
                FROM purchase_record
                where brand = ${品牌}
                and `date` >= ${开始时间} and `date` <= ${结束时间}
                """;
        String s = processDynamicBlocks(sql, Map.of("值字段", "", "品牌", "ddd"));
        System.out.println(s);
        System.out.println(DynamicBlocks.extractVariables(sql));
        Map<String, Object> params = new HashMap<>();
        params.put("值字段", "购入价格");
        params.put("品牌", "华为");
        params.put("最低价", 20);

        String sql1 = "SELECT !{ @if(值字段 == '购入价格' && 最低价 > 100) price, @else brand }! FROM products";
        String processed = processDynamicBlocks(sql1, params);
        System.out.println(processed);
    }
}