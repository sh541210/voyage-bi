package top.fusb.voyagebi.utils;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public class DateToLongDeserializer extends JsonDeserializer<Long> {
    // 旧数据的日期格式，例如："yyyy-MM-dd HH:mm:ss"
    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final ZoneId ZONE_ID = ZoneId.systemDefault(); // 根据实际情况调整时区

    @Override
    public Long deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        JsonNode node = p.getCodec().readTree(p);
        if (node.isNumber()) {
            // 直接返回 long 时间戳
            return node.asLong();
        } else if (node.isTextual()) {
            String value = node.textValue();
            if (value.trim().isEmpty()) {
                return null;
            }
            try {
                // 尝试解析为 long（应对数值型字符串，如 "1672576496000"）
                return Long.parseLong(value);
            } catch (NumberFormatException e) {
                // 尝试解析为旧日期字符串，再转为时间戳
                LocalDateTime dateTime = LocalDateTime.parse(value, DATE_FORMATTER);
                return dateTime.atZone(ZONE_ID).toInstant().toEpochMilli();
            }
        } else {
            throw new IOException("字段类型不兼容，应为字符串或数值");
        }
    }
}