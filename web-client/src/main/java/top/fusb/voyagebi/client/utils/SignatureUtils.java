package top.fusb.voyagebi.client.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import lombok.extern.slf4j.Slf4j;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Slf4j
public class SignatureUtils {
    // 配置参数
    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final String DIGEST_ALGORITHM = "SHA-256";
    private static final long TIME_TOLERANCE = 300; // 5分钟有效期

    /////////////////////////////
    // 客户端生成签名头的方法
    /////////////////////////////

    /**
     * 生成完整的签名头信息
     *
     * @param secretKey 密钥实际内容
     * @param keyId     密钥标识符
     * @param method    HTTP方法（大写）
     * @param path      请求路径
     * @param body      请求体对象（可序列化为JSON）
     * @return 包含所有认证头的Map
     */
    public static Map<String, String> generateHeaders(
            String secretKey,
            String keyId,
            String method,
            String path,
            Object body) {
        try {
            String timestamp = String.valueOf(Instant.now().getEpochSecond());
            String bodyJson = serializeBody(body);
            String digest = computeDigest(bodyJson);
            String signingData = buildSigningData(method, path, timestamp, digest);
            String signature = computeHmac(secretKey, signingData);

            return buildFinalHeaders(keyId, timestamp, digest, signature);
        } catch (Exception e) {
            throw new SignatureException("生成签名头失败", e);
        }
    }

    /////////////////////////////
    // 服务端验证签名的方法 
    /////////////////////////////

    /**
     * 验证请求签名有效性
     *
     * @param headers        请求头集合
     * @param method         实际请求方法
     * @param path           实际请求路径
     * @param body           实际请求体内容
     * @param secretProvider 密钥提供器接口
     * @return 是否验证通过
     */
    public static boolean verify(
            Map<String, String> headers,
            String method,
            String path,
            String body,
            SecretProvider secretProvider) {
        try {
            // 1. 提取基础参数
            String timestamp = getRequiredHeader(headers, "Timestamp");
            String digestHeader = getRequiredHeader(headers, "Digest");
            String signatureHeader = getRequiredHeader(headers, "Signature");

            // 2. 解析关键参数
            String clientDigest = digestHeader.split("=", 2)[1];
            String clientSignature = parseSignature(signatureHeader);
            String keyId = parseKeyId(signatureHeader);

            // 3. 验证时间窗口
            validateTimestamp(timestamp);

            // 4. 验证请求体完整性
            validateBodyDigest(body, clientDigest);

            // 5. 获取密钥并生成服务端签名
            String secretKey = secretProvider.getSecret(keyId);
            String serverSignature = recomputeSignature(method, path, timestamp, clientDigest, secretKey);

            // 6. 安全比较
            return secureCompare(clientSignature, serverSignature);
        } catch (Exception e) {
            log.warn("Sign valid failed", e);
            return false;
        }
    }

    /////////////////////////////
    // 共享内部工具方法
    /// //////////////////////////

    private static String serializeBody(Object body) throws JsonProcessingException {
        // 使用与前端一致的JSON序列化规则
        return new ObjectMapper()
                .enable(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS)
                .writeValueAsString(body);
    }

    private static String computeDigest(String bodyJson) throws Exception {
        MessageDigest md = MessageDigest.getInstance(DIGEST_ALGORITHM);
        byte[] digest = md.digest(bodyJson.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(digest);
    }

    static String buildSigningData(String method, String path, String timestamp, String digest) {
        Map<String, String> params = new TreeMap<>();
        params.put("method", method.toUpperCase());
        params.put("path", path);
        params.put("timestamp", timestamp);
        params.put("digest", DIGEST_ALGORITHM.toLowerCase() + "=" + digest);
        return params.entrySet().stream()
                .map(e -> e.getKey() + "=" + e.getValue())
                .collect(Collectors.joining("&"));
    }

    private static String computeHmac(String secret, String data) throws Exception {
        Mac hmac = Mac.getInstance(HMAC_ALGORITHM);
        hmac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM));
        return Base64.getEncoder().encodeToString(hmac.doFinal(data.getBytes()));
    }

    /////////////////////////////
    // 辅助方法
    /// //////////////////////////

    private static Map<String, String> buildFinalHeaders(String keyId, String timestamp,
                                                         String digest, String signature) {
        Map<String, String> headers = new LinkedHashMap<>();
        headers.put("Content-Type", "application/json");
        headers.put("Timestamp", timestamp);
        headers.put("Digest", DIGEST_ALGORITHM.toLowerCase() + "=" + digest);
        headers.put("Signature", String.format(
                "keyId=\"%s\",algorithm=\"%s\",signature=\"%s\"",
                keyId,
                HMAC_ALGORITHM.replace("Hmac", "").toLowerCase(),
                signature
        ));
        return headers;
    }

    private static void validateTimestamp(String timestamp) {
        long clientTime = Long.parseLong(timestamp);
        long serverTime = Instant.now().getEpochSecond();
        if (Math.abs(serverTime - clientTime) > TIME_TOLERANCE) throw new SignatureException("时间戳已过期");
    }

    private static void validateBodyDigest(String actualBody, String expectedDigest) throws Exception {
        String actualDigest = computeDigest(actualBody);
        if (!expectedDigest.equals(actualDigest)) throw new SignatureException("请求体摘要不匹配");
    }

    private static String getRequiredHeader(Map<String, String> headers, String name) {
        String value = headers.get(name);
        if (value == null || value.isEmpty()) throw new SignatureException("缺少必要头信息: " + name);
        return value;
    }

    private static String parseKeyId(String signatureHeader) {
        return signatureHeader.split("keyId=\"")[1].split("\"")[0];
    }

    private static String parseSignature(String signatureHeader) {
        return signatureHeader.split("signature=\"")[1].replace("\"", "");
    }

    private static boolean secureCompare(String a, String b) {
        return MessageDigest.isEqual(a.getBytes(StandardCharsets.UTF_8), b.getBytes(StandardCharsets.UTF_8));
    }

    /////////////////////////////
    // 异常类与接口定义
    /// //////////////////////////

    public static class SignatureException extends RuntimeException {
        public SignatureException(String message, Throwable cause) {
            super(message, cause);
        }

        public SignatureException(String message) {
            super(message);
        }
    }

    @FunctionalInterface
    public interface SecretProvider {
        String getSecret(String keyId) throws SignatureException;
    }

    private static String recomputeSignature(String method, String path,
                                             String timestamp, String digest,
                                             String secretKey) throws Exception {
        String signingData = buildSigningData(method, path, timestamp, digest);
        return computeHmac(secretKey, signingData);
    }
}