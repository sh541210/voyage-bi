package top.fusb.voyagebi.client.utils;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;

public class HttpUtils {

    private static final int MAX_RETRIES = 3; // 最大重试次数
    private static final Duration RETRY_DELAY = Duration.ofSeconds(2); // 重试间隔时间
    private static final ObjectMapper objectMapper = new ObjectMapper(); // Jackson ObjectMapper

    // 通用 HTTP 请求方法，使用 TypeReference 来解决泛型擦除问题
    public static <T> T sendRequest(String method, String url, Object requestBody,
                                    TypeReference<T> responseType, Map<String, String> headers) throws Exception {
        return sendWithRetry(() -> {
            String requestJson = requestBody != null ? objectMapper.writeValueAsString(requestBody) : null;
            String jsonResponse = sendHttpRequest(method, url, requestJson, headers);
            return objectMapper.readValue(jsonResponse, responseType); // 使用 TypeReference 进行反序列化
        });
    }

    // 发送 HTTP 请求，根据 method 决定使用 GET, POST, PUT, DELETE 等
    private static String sendHttpRequest(String method, String url,
                                          String requestBody, Map<String, String> headers) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(new URI(url))
                .header("Content-Type", "application/json");

        // 添加自定义请求头
        if (headers != null) {
            headers.forEach(builder::header);
        }

        // 根据 HTTP 方法决定请求类型
        switch (method.toUpperCase()) {
            case "GET":
                builder.GET();
                break;
            case "POST":
                builder.POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8));
                break;
            case "PUT":
                builder.PUT(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8));
                break;
            case "DELETE":
                if (requestBody != null) {
                    builder.method("DELETE", HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8));
                } else {
                    builder.DELETE();
                }
                break;
            default:
                throw new IllegalArgumentException("Unsupported HTTP method: " + method);
        }

        HttpRequest request = builder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }

    // 带重试逻辑的通用方法
    private static <T> T sendWithRetry(RequestExecutor<T> executor) throws Exception {
        int attempt = 0;
        Exception lastException = null;

        while (attempt < MAX_RETRIES) {
            try {
                return executor.execute();
            } catch (Exception e) {
                lastException = e;
                attempt++;
                System.out.println("请求失败，重试次数: " + attempt);
                Thread.sleep(RETRY_DELAY.toMillis());
            }
        }
        throw new Exception("重试超过最大次数，操作失败", lastException);
    }

    // 函数式接口，用于执行 HTTP 请求
    @FunctionalInterface
    interface RequestExecutor<T> {
        T execute() throws Exception;
    }
}