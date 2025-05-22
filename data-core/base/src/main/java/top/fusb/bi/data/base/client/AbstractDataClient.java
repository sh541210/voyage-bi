package top.fusb.bi.data.base.client;

import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import net.sf.jsqlparser.JSQLParserException;
import net.sf.jsqlparser.parser.ParseException;
import org.apache.commons.codec.digest.DigestUtils;
import top.fusb.bi.data.base.domin.QueryDataSet;
import top.fusb.bi.data.base.exception.DbException;
import top.fusb.bi.data.base.parser.SelectHandler;
import top.fusb.bi.data.base.parser.VariablesSQLHandler;

import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.*;

@Slf4j
public abstract class AbstractDataClient implements DataClient {
    // 控制并行度的线程池
    private final ExecutorService executor;
    private final Map<String, CompletableFuture<QueryDataSet>> queryTasks = new ConcurrentHashMap<>();
    @Setter
    private SelectHandler sqlOptimizer;

    public AbstractDataClient(int parallelism) {
        executor = Executors.newFixedThreadPool(parallelism);
        Executors.newSingleThreadScheduledExecutor().scheduleAtFixedRate(() -> {
            if (executor instanceof ThreadPoolExecutor executor) {
                log.info("线程池信息：\n{}", executor);
            }
        }, 0, 1, TimeUnit.MINUTES);
    }

    /**
     * 处理SQL
     *
     * @param sql       sql
     * @param variables 变量
     * @return sql
     */
    protected String handleSQLBeforeRun(String sql, Map<String, Object> variables) {
        try {
            // 替换变量
            VariablesSQLHandler variablesSQLHandler = new VariablesSQLHandler(getDsType(), variables);
            variablesSQLHandler.setSqlOptimizer(sqlOptimizer);
            // 最终SQL
            return variablesSQLHandler.handleSQL(sql);
        } catch (JSQLParserException e) {
            log.warn("处理SQL异常, SQL: {}", sql, e);
            Throwable cause = e.getCause();
            if (cause instanceof ExecutionException) {
                Throwable ex = cause.getCause();
                if (ex instanceof ParseException) {
                    throw new DbException("解析SQL异常，" + ex.getMessage(), ex);
                }
            }
            throw new DbException("处理SQL异常, " + e.getMessage(), e);
        }
    }

    public String generateTaskKey(String sql, Map<String, Object> variables) {
        Map<String, Object> sortedVars = new TreeMap<>(variables);
        String keyBuilder = "|" + sql +
                "|" + sortedVars;
        return DigestUtils.sha256Hex(keyBuilder);
    }

    @Override
    public CompletableFuture<QueryDataSet> getDataSet(String sql, Map<String, Object> variables) {
        // 尝试获取正在进行的任务
        return queryTasks.computeIfAbsent(generateTaskKey(sql, variables), key -> {
            Long submitTime = System.currentTimeMillis();
            // 如果没有任务，提交新的查询任务
            return CompletableFuture.supplyAsync(() -> {
                try {
                    Long start = System.currentTimeMillis();
                    String handledSQL = handleSQLBeforeRun(sql, variables);
                    QueryDataSet dataSet = queryForDataSet(handledSQL);
                    QueryDataSet.QueryMetadata metadata = dataSet.getMetadata();
                    metadata.setSubmitTime(submitTime);
                    metadata.setOriginSql(handledSQL);
                    metadata.setQueryStartTime(start);
                    metadata.setQueryEndTime(System.currentTimeMillis());
                    return dataSet;
                } finally {
                    queryTasks.remove(key); // 任务完成后移除
                }
            }, executor);
        });
    }

    /**
     * 子类实现具体的查询逻辑
     */
    protected abstract QueryDataSet queryForDataSet(String sql);

    /**
     * 手动清理缓存
     */
    public void clearCache() {
        queryTasks.clear();
    }

    /**
     * 停止线程池服务
     */
    @Override
    public void shutdown() {
        executor.shutdown();
        try {
            if (!executor.awaitTermination(5, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
        }
    }
}
