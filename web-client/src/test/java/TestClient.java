import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.Test;
import top.fusb.voyagebi.client.domain.ChartDataRequest;
import top.fusb.voyagebi.client.domain.Dashboard;
import top.fusb.voyagebi.client.domain.DataResult;
import top.fusb.voyagebi.client.domain.SheetDataGetParam;
import top.fusb.voyagebi.client.utils.DefaultVoyageBiClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class TestClient {
    DefaultVoyageBiClient client = new DefaultVoyageBiClient("http://localhost:8088", "", "VOYAGE BI");

    @Test
    public void test3() throws JsonProcessingException {
        Map<String, Object> map = new HashMap<>();
        map.put("number",1);
        map.put("map", Map.of(1,"sdf"));
        map.put("list", List.of(199));
        map.put("boolean", false);
        Object result = client.testSign(map);
        System.out.println(toJson(result));
    }

    private static String toJson(Object object) {
        try {
            return new ObjectMapper().writeValueAsString(object);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    public void test23() {
        Map<String, Dashboard> infoByKeys = client.getInfoByKeys(List.of("4O32Cpml434A5t0x"));
        System.out.println(infoByKeys);
    }

    @Test
    public void testGet() {
        ChartDataRequest request = new ChartDataRequest();
        request.setChartId(42L);
        DataResult data = client.getData(request);
        System.out.println(toJson(data));
        int count = client.getDataCount(request);
        System.out.println(count);
        SheetDataGetParam param = new SheetDataGetParam();
        param.setId(1L);
        DataResult sheetData = client.getSheetData(param);
        System.out.println(toJson(sheetData));
    }

    @Test
    public void testGetByKey() {
//        client.getData(new ChartDataRequest());
        Object result = client.getDashboards(null);
        System.out.println(toJson(result));
    }
}
