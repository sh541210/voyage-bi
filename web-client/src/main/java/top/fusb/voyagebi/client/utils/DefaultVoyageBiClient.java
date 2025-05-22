package top.fusb.voyagebi.client.utils;

import com.fasterxml.jackson.core.type.TypeReference;
import top.fusb.voyagebi.client.VoyageBiClient;
import top.fusb.voyagebi.client.domain.*;

import java.util.List;
import java.util.Map;

public class DefaultVoyageBiClient implements VoyageBiClient {
    private final String baseUrl;
    private final String secretKey;
    private final String keyId;

    public DefaultVoyageBiClient(String baseUrl,String keyId, String secretKey) {
        if (!baseUrl.startsWith("http") && !baseUrl.startsWith("https")) {
            baseUrl = "http://" + baseUrl;
        }
        this.baseUrl = baseUrl;
        this.secretKey = secretKey;
        this.keyId = keyId;
    }

    public <T> TypeReference<Result<T>> buildType() {
        return new TypeReference<>() {
        };
    }

    @Override
    public String getSecretKey() {
        return secretKey;
    }

    @Override
    public String getKeyId() {
        return keyId;
    }

    @Override
    public Map<String, Dashboard> getInfoByKeys(List<String> keys) {
        return sendRequest("GET", "/api/dashboard/share/info?keys="+String.join(",",keys),
                new TypeReference<>() {
                });
    }

    @Override
    public List<Dashboard> getDashboards(Long appId) {
        String path = "/api/dashboard/share/list";
        if(appId!=null) {
            path+="?appId="+appId;
        }
        return sendRequest("GET", path, new TypeReference<>() {
        });
    }

    @Override
    public Object testSign(Map<String, Object> body) {
        return sendRequest("POST", "/api/test/sign", new TypeReference<>() {
        },body);
    }

    @Override
    public DataResult getData(ChartDataRequest dataRequest) {
        return sendRequest("POST", "/api/chart/data/v2", new TypeReference<>() {
        }, dataRequest);
    }

    @Override
    public int getDataCount(ChartDataRequest dataRequest) {
        return sendRequest("POST", "/api/chart/data/count", new TypeReference<>() {
        }, dataRequest);
    }

    @Override
    public DataResult getSheetData(SheetDataGetParam param) {
        return sendRequest("POST", "/api/data-sheet/data/v2", new TypeReference<>() {
        }, param);
    }

    @Override
    public Object getDashboardShare(String key) {
        return sendRequest("GET", "/api/dashboard/share?key=" + key, new TypeReference<>() {
        });
    }

    @Override
    public List<Object> getDashboardShares(String keys) {
        return sendRequest("GET", "/api/dashboard/share/snapshot/list?keys=" + keys,
                new TypeReference<>() {
                });
    }

    @Override
    public String getChartName(Long chartId) {
        return sendRequest("GET", "/api/chart/name?chartId=" + chartId, new TypeReference<>() {
        });
    }

    public <T> T sendRequest(String method, String path, TypeReference<Result<T>> type, Object... body) {
        return VoyageBiClient.super.sendRequest(baseUrl, method, path, type, body);
    }
}
