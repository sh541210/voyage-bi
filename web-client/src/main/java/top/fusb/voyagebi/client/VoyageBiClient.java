package top.fusb.voyagebi.client;

import com.fasterxml.jackson.core.type.TypeReference;
import top.fusb.voyagebi.client.domain.*;
import top.fusb.voyagebi.client.utils.HttpUtils;
import top.fusb.voyagebi.client.utils.SignatureUtils;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface VoyageBiClient {

    String getSecretKey();

    String getKeyId();

    Map<String, Dashboard> getInfoByKeys(List<String> keys);

    List<Dashboard> getDashboards(Long appId);

    Object testSign(Map<String, Object> body);

    DataResult getData(ChartDataRequest dataRequest);

    int getDataCount(ChartDataRequest dataRequest);

    DataResult getSheetData(SheetDataGetParam param);

    Object getDashboardShare(String key);

    List<Object> getDashboardShares(String keys);

    String getChartName(Long chartId);

    // 有请求体的 sendRequest 方法
    default <T> T sendRequest(String baseUrl,
                              String method,
                              String path,
                              TypeReference<Result<T>> type, Object... body) {
        Object requestBody = body.length > 0 ? body[0] : null;
        // 生成签名
        Map<String, String> headers = SignatureUtils
                .generateHeaders(getSecretKey(), getKeyId(), method, path,  requestBody);
        Result<T> result;
        try {
            result = HttpUtils.sendRequest(method, baseUrl + path,
                    Optional.of(body).filter(i -> i.length > 0)
                            .map(i -> i[0]).orElse(null),
                    type, headers);
        } catch (Exception e) {
            throw new RuntimeException("请求出错", e);
        }
        if (!result.isSuccess()) {
            throw new RuntimeException("请求出错, msg:" + result.getMessage() + ", code:" + result.getCode());
        }
        return result.getData();
    }
}
