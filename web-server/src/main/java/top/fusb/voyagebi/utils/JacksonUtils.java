package top.fusb.voyagebi.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.ser.std.DateSerializer;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.function.Consumer;

public class JacksonUtils {
    private static final ObjectMapper MAPPER = new ObjectMapper();
    static {
        SimpleModule module = new SimpleModule();
        module.addSerializer(Date.class, new DateSerializer(
                false, new SimpleDateFormat("yyyy-MM-dd HH:mm:ss")));
        MAPPER.registerModule(module);

        // 禁用时间戳
        MAPPER.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
    }

    public static JsonNode toJsonNode(Object obj) {
        return MAPPER.valueToTree(obj);
    }

    public static void setMapper(Consumer<ObjectMapper> consumer) {
        consumer.accept(MAPPER);
    }

    public static <T> List<T> parseArray(String json, Class<T> tClass) throws JsonProcessingException {
        return MAPPER.readValue(json, MAPPER.getTypeFactory()
                .constructCollectionType(List.class, tClass));
    }

    public static <T> T parseObject(String json, Class<T> tClass) throws JsonProcessingException {
        return MAPPER.readValue(json, tClass);
    }

    public static <T> T parseObject(Object fromValue, Class<T> tClass) {
        return MAPPER.convertValue(fromValue, tClass);
    }

    public static String toJsonStr(Object object, Boolean... format) {
        try {
            if (format != null && format.length > 0 && format[0]) {
                return MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(object);
            }
            return MAPPER.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("bean to json error", e);
        }
    }
}
