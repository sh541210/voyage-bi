package top.fusb.voyagebi.utils;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.time.DateUtils;
import org.reflections.Reflections;
import org.reflections.scanners.Scanners;
import org.reflections.util.ConfigurationBuilder;

import java.lang.reflect.*;
import java.text.ParseException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
public class ReflectUtils {

    private static final Map<String, Field> fieldMap = new ConcurrentHashMap<>();
    private static final Map<Class<?>, List<Field>> fieldsMap = new ConcurrentHashMap<>();

    public static <R> R newInstance(Class<R> rClass) {
        try {
            Constructor<R> constructor = rClass.getConstructor();
            constructor.setAccessible(true);
            return constructor.newInstance();
        } catch (Exception e) {
            throw new RuntimeException("实例化对象异常" + rClass.getSimpleName(), e);
        }
    }

    public static <R> R newInstance(Class<R> rClass, List<Class<?>> types, List<Object> args) {
        try {
            Constructor<R> constructor = rClass.getConstructor(types.toArray(new Class[]{}));
            constructor.setAccessible(true);
            return constructor.newInstance(args.toArray(new Object[]{}));
        } catch (Exception e) {
            throw new RuntimeException("实例化对象异常" + rClass.getSimpleName(), e);
        }
    }

    public static <T> Set<Class<? extends T>> findClasses(String packageName, Class<T> clazz) {
        // 使用 Reflections 库扫描指定包及其子包中的类
        Reflections reflections = new Reflections(new ConfigurationBuilder()
                .forPackages(packageName)
                .addScanners(Scanners.SubTypes));
        // 获取继承自 T 的所有子类
        return reflections.getSubTypesOf(clazz);
    }

    public static Class<?> getSuperClassParameterClass(Class<?> clazz) {
        try {
            return (Class) ((ParameterizedType) clazz.getGenericSuperclass()).getActualTypeArguments()[0];
        } catch (Exception var3) {
            throw new RuntimeException(var3);
        }
    }

    public static boolean isAbstractClass(Class<?> clazz) {
        // 使用 Modifier 类的 isAbstract 方法检查类是否是抽象类
        return Modifier.isAbstract(clazz.getModifiers());
    }

    public static Class<?> getListFieldClass(Class<?> clazz, String fieldName) {
        return getFieldClass(clazz, fieldName, List.class);
    }

    /**
     * 获取指定类中指定字段的类型
     *
     * @param clazz     要检查的类
     * @param fieldName 字段的名称
     * @return 字段的类型，如果找不到字段则返回 null
     */
    public static Class<?> getFieldClass(Class<?> clazz, String fieldName, Class<?> resultClass) {
        try {
            List<Field> fields = getFields(clazz);
            for (Field field : fields) {
                if (field.getName().equals(fieldName) || (resultClass != null && resultClass.isAssignableFrom(field.getType()))) {
                    Type genericType = field.getGenericType();
                    if (genericType instanceof ParameterizedType) {
                        ParameterizedType pt = (ParameterizedType) genericType;
                        Type[] actualTypeArguments = pt.getActualTypeArguments();
                        if (actualTypeArguments.length > 0) {
                            return (Class<?>) actualTypeArguments[0];
                        }
                    }
                    return field.getType();
                }
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 设置指定类的指定字段的值
     *
     * @param obj       目标对象
     * @param fieldName 字段名称
     * @param value     要设置的值
     */
    public static void setFieldValue(Object obj, String fieldName, Object value) {
        try {
            Field field = getField(obj.getClass(), fieldName);
            Object convertedValue = convertType(value, field.getType());
            field.set(obj, convertedValue);
        } catch (Exception e) {
            throw new RuntimeException("Set field value error", e);
        }
    }

    private static Object convertType(Object value, Class<?> targetType) throws ParseException {
        if (value == null) {
            return null;
        }

        if (targetType.isAssignableFrom(value.getClass())) {
            return value;
        }

        if (targetType == int.class || targetType == Integer.class) {
            return Integer.parseInt(value.toString());
        } else if (targetType == long.class || targetType == Long.class) {
            return Long.parseLong(value.toString());
        } else if (targetType == double.class || targetType == Double.class) {
            return Double.parseDouble(value.toString());
        } else if (targetType == float.class || targetType == Float.class) {
            return Float.parseFloat(value.toString());
        } else if (targetType == boolean.class || targetType == Boolean.class) {
            return Boolean.parseBoolean(value.toString());
        } else if (targetType == short.class || targetType == Short.class) {
            return Short.parseShort(value.toString());
        } else if (targetType == byte.class || targetType == Byte.class) {
            return Byte.parseByte(value.toString());
        } else if (targetType == char.class || targetType == Character.class) {
            return value.toString().charAt(0);
        } else if (targetType == Date.class) {
            return DateUtils.parseDate(value.toString());
        }

        throw new IllegalArgumentException("Unsupported target type: " + targetType.getName());
    }

    public static Object getFieldValue(Object obj, String fieldName) {
        String[] split = fieldName.split("\\.");
        Object result = obj;
        for (String name : split) {
            Field field = getField(result.getClass(), name);
            try {
                result = field.get(result);
            } catch (Exception e) {
                throw new RuntimeException("获取" + name + "出错", e);
            }
        }
        return result;
    }

    public static Field getField(Class<?> clazz, String fieldName) {
        return fieldMap.computeIfAbsent(clazz.getName() + fieldName, i -> {
            try {
                return getFields(clazz).stream().filter(j -> j.getName().equals(fieldName))
                        .peek(j -> j.setAccessible(true))
                        .findFirst()
                        .orElseThrow(() -> new NoSuchFieldException("Not found field " + fieldName + " in " + clazz.getName()));
            } catch (NoSuchFieldException e) {
                throw new RuntimeException(fieldName + "不存在");
            }
        });
    }

    public static Set<String> getFieldNames(Class<?> clazz) {
        return getFields(clazz).stream().map(Field::getName).collect(Collectors.toSet());
    }

    public static List<Field> getFields(Object object) {
        if (object == null) {
            return List.of();
        }
        return getFields(object.getClass());
    }

    public static List<Field> getFields(Class<?> clazz_) {
        return fieldsMap.computeIfAbsent(clazz_, clazz -> {
            List<Field> fieldList = new ArrayList<>();
            while (clazz != null) {
                for (Field field : clazz.getDeclaredFields()) {
                    if (!Modifier.isStatic(field.getModifiers())) {
                        fieldList.add(field);
                    }
                }
                clazz = clazz.getSuperclass();
            }
            return fieldList;
        });
    }

    public static Class<?> getRawType(Type type) {
        if (type instanceof ParameterizedType) {
            return (Class<?>) ((ParameterizedType) type).getRawType();
        } else if (type instanceof Class) {
            return (Class<?>) type;
        }
        throw new IllegalArgumentException("Unexpected type: " + type);
    }

    public static Class<?> getClassFromType(Type type) {
        if (type instanceof ParameterizedType) {
            return (Class<?>) ((ParameterizedType) type).getRawType();
        } else if (type instanceof Class) {
            return (Class<?>) type;
        }
        throw new IllegalArgumentException("Unexpected type: " + type);
    }

    public static Class<?> getGenericClass(Field field) {
        Type genericFieldType = field.getGenericType();

        if (genericFieldType instanceof ParameterizedType) {
            ParameterizedType parameterizedType = (ParameterizedType) genericFieldType;
            Type[] fieldArgTypes = parameterizedType.getActualTypeArguments();
            if (fieldArgTypes.length > 0) {
                return (Class<?>) fieldArgTypes[0];
            }
        }
        return null;
    }

    public static Class<?> getSuperclassGenericType(Class<?> clazz) {
        Type genericSuperclass = clazz.getGenericSuperclass();

        if (genericSuperclass instanceof ParameterizedType) {
            ParameterizedType parameterizedType = (ParameterizedType) genericSuperclass;
            Type[] typeArgs = parameterizedType.getActualTypeArguments();
            if (typeArgs.length > 0) {
                try {
                    Type type = typeArgs[0];
                    if (type instanceof Class<?>) {
                        return (Class<?>) type;
                    } else if (type instanceof ParameterizedType) {
                        return getRawType(type);
                    }
                } catch (Exception e) {
                    log.error("", e);
                    return null;
                }
            }
        }
        return null;
    }
}
