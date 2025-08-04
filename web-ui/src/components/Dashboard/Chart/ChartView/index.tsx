import AntdChartView from "./antd"
import DataTable from "@/components/base/DataTable"
import { useContainerWidth, watch } from "@/hooks"
import EchartsView from "./echarts"
import UchartView from "./uchart"
import { LoadingOutlined } from "@ant-design/icons"
import { useCallback, useEffect, useMemo, useState } from "react"
import ChartTypeSelector from "../ChartTypeSelector"
import React from "react"
import { useModel } from "@umijs/max"
import { deepEqual, execTs, toIndexes } from "@/utils/common/common"
import classNames from "classnames"
import EchartsMapView from "./echarts/MapView"
import DynamicRenderer from "./ReactChartComponent"
import { renderEmpty, renderErrorPrint } from "@/utils/render"
import * as echarts from 'echarts';

export interface GraphEvent<T = any> {
    name: GraphEventName
    data: T
}

export interface ChartViewProps {
    chartType: ChartType
    xColumns: Column[]
    yColumns: Column[]
    chartStyleCfg: ChartStyleCfg
    mobile?: boolean
    renderCode?: string
    graphRenderType: GraphRenderType
    onTableClick?: (rowIndex: number, colIndex?: number, actionIdx?: number | null) => void
    onGraphEvent?: <T = any> (event: GraphEvent<T>) => Promise<void>
    chartId: number
    dataRequest: ChartDataRequest
    onDataUpdate: (dataRequest: ChartDataRequest, callback: (result: DataResult) => void) => void
    chartComponent?: ChartComponentVO
}

const ChartView = (props: ChartViewProps) => {
    const { ref, width } = useContainerWidth()
    const { systemConfig, getChartComponent } = useModel('system')
    const { chartStyleCfg, mobile = false, chartComponent, } = props
    const [dataResult, setDataResult] = useState<DataResult>()
    const [chartType, setChartType] = useState<ChartType>(props.chartType)
    const { dark } = useModel('global')
    const [dynamicSort, setDynamicSort] = useState<{ key: ColumnKey, orderBy: SortOrderBy | undefined }>()
    const [loading, setLoading] = useState<boolean>(false)

    // 请求数据更新
    const fetchData = () => {
        setLoading(true)
        props.onDataUpdate({
            ...props.dataRequest,
            sorts: dynamicSort?.orderBy ? [dynamicSort] : []
        }, result => {
            setDataResult(result)
            setLoading(false)
        })
    }

    // 根据数据变动判断是否更新数据
    watch(props.dataRequest, (pre, next) => {
        if (props.xColumns.length == 0 && props.yColumns.length == 0) {
            return
        }
        // 判断钻取参数、变量参数、x/y轴变更
        if (!deepEqual(pre?.drillDownParam, next.drillDownParam) ||
            !deepEqual(pre?.parameters, next.parameters) ||
            !deepEqual(pre?.chartCfg?.groupBy, next.chartCfg?.groupBy) ||
            !deepEqual(pre?.chartCfg?.values, next.chartCfg?.values)) {
            fetchData()
        }
    })

    // 动态排序更新数据
    useEffect(() => {
        if (props.xColumns.length == 0 && props.yColumns.length == 0) {
            return
        }
        fetchData()
    }, [dynamicSort])

    useEffect(() => setChartType(props.chartType), [props.chartType])

    const formatData = useCallback((chartType: ChartType, dataResult?: DataResult): DataSet | undefined => {
        if (!dataResult) {
            return { columns: [], rows: [], y: [], x: [] }
        }
        const canFormat = ['INDICATOR', 'TABLE'].includes(chartType)
        const data = { ...dataResult.data }
        // 格式化字段
        const columns = [...props.xColumns, ...props.yColumns]
        return {
            ...data,
            columns: data.columns,
            rows: data.rows?.map(line => line.map((val, index) => {
                const valueProps = columns[index]?.valueProps
                const isNumber = typeof val === 'number'
                let value = val
                if (val !== undefined && val !== null) {
                    if (!valueProps) {
                        return val
                    }
                    let percent = false
                    if (canFormat) {
                        // 是否需要加百分号
                        percent = (valueProps?.percent && !(String(value).includes('%'))) ?? false
                        // 乘100
                        if (isNumber && percent) value = value * 100
                    }
                    // 取位数
                    if (isNumber &&
                        value % 1 !== 0 && valueProps?.digit !== undefined) {
                        value = value.toFixed(valueProps.digit)
                    }
                    if (canFormat) {
                        // 分隔符
                        if (isNumber && valueProps?.numberSplit) {
                            value = Intl.NumberFormat('en-US', valueProps.digit !== undefined ? {
                                minimumFractionDigits: valueProps.digit,
                                maximumFractionDigits: valueProps.digit
                            } : {}).format(value)
                        }
                        // 增加百分号
                        percent && (value = value + (percent ? '%' : ''))
                        // 增加单位
                        valueProps?.unit && (value = value + valueProps?.unit)
                    }
                } else {
                    value = '-'
                }
                return value
            }))
        }
    }, [dataResult, chartType])

    const getConfig = (chartComponent: ChartComponentVO | undefined, data: DataSet | undefined) => {
        if (!chartComponent) {
            throw new Error(`未找到组件「${chartType}」`)
        }
        const name = chartComponent.name || chartComponent.code || chartType
        const script = chartComponent.props.script
        if (!script || script.trim().length === 0) {
            throw new Error(`组件「${name}」的渲染逻辑为空`)
        }
        let config;
        try {
            // 执行渲染代码的第一个阶段
            config = execTs(script, {
                data, chartType, mobile, dark,
                echarts,
                renderConfig: props.chartStyleCfg.renderChartConfig || {},
                transpose: (matrix: any[][]) => matrix[0]?.map((_, colIndex) => matrix.map(row => row[colIndex]))
            });
        } catch (ex: any) {
            // 捕获异常并抛出
            throw new Error(`组件「${name}」的渲染逻辑执行错误: ${ex.message}`);
        }
        config = checkConfig(config)
        if (!props.renderCode) {
            return config
        }
        try {
            // 执行渲染代码的第二阶段
            config = execTs(props.renderCode, {
                config,
                data, chartType, mobile, dark,
                echarts,
                renderConfig: props.chartStyleCfg.renderChartConfig || {},
                transpose: (matrix: any[][]) => matrix[0]?.map((_, colIndex) => matrix.map(row => row[colIndex]))
            });
        } catch (ex: any) {
            // 捕获异常并抛出
            throw new Error(`主题渲染逻辑执行错误: ${ex.message}`);
        }
        return checkConfig(config)
    };

    const checkConfig = (config: any) => {
        if (!config) {
            throw new Error('配置为空或未定义')
        }
        if (props.graphRenderType === 'echarts' && !config.option) {
            throw new Error('未找到ECharts的option配置!')
        }
        return config
    }

    // 图表内容
    const content = useMemo(() => {
        let chartCp = chartComponent || getChartComponent(chartType)
        if (!dataResult) {
            if (!chartCp?.props.allowEmptyData) {
                return
            }
        } else {
            if (!dataResult?.success) {
                return renderEmpty(<div className=" text-red-600 dark:text-red-500">{dataResult?.message}</div>)
            }
        }
        let data = formatData(chartType, dataResult);
        const dataEmpty = !data || data.rows.length == 0
        if (dataEmpty && !chartCp?.props.allowEmptyData) {
            return renderEmpty('当前图表无数据')
        } else if (chartType === 'TABLE') {
            if (dataEmpty) {
                return renderEmpty('当前图表无数据')
            }
            const allColumns = [...props.xColumns, ...props.yColumns]
            const highlights = systemConfig?.tableHighlights.map(i => ({
                ...i, className: i.className || i.name,
                indexes: toIndexes(allColumns, chartStyleCfg.highlights?.[i.name] || [], 'key')
            })).filter(i => i.indexes.length > 0)
            const sortedIndexes = toIndexes(allColumns, chartStyleCfg.sortedKeys || [], 'key')
            const hideIndexes = toIndexes(allColumns, chartStyleCfg.tableHideKeys?.[mobile ? 'mobile' : 'pc'] || [], 'key')
            return <div className="p-2 relative h-full w-full chart-table">
                <DataTable
                    scrollOptions={{ auto: props.chartStyleCfg.autoScroll, loop: true }}
                    onColClick={(rowIndex, colIndex, _) => props.onTableClick?.(rowIndex, colIndex, undefined)}
                    highlights={highlights}
                    sortedIndexes={sortedIndexes}
                    hideColumnIndexes={hideIndexes}
                    showIndex={chartStyleCfg?.showIndex}
                    indexColumnName={chartStyleCfg?.indexName}
                    size={mobile ? 'mini' : 'small'}
                    pagination={{
                        pageSize: chartStyleCfg?.pageSize || 15,
                        hidden: chartStyleCfg?.hidePagination,
                        total: data?.total
                    }}
                    onSortChange={(index: number, orderBy) => {
                        setDynamicSort({ key: allColumns[index]?.key, orderBy })
                    }}
                    data={data}
                    actions={(_, index) => (chartStyleCfg?.actions || []).map((action, idx) => <div key={`${index}-${idx}`}
                        className="inline-block cursor-pointer text-primaryColor bg-inherit px-2 py-1"
                        onClick={(e) => {
                            props.onTableClick?.(index, undefined, idx);
                            e.stopPropagation();
                        }}
                    >{action}</div>)}
                />
            </div>
        } else {
            if (chartCp?.type === 'react') {
                return <DynamicRenderer name={chartCp.code} code={chartCp?.props.script}
                    args={{
                        yColumns: props.yColumns, xColumns: props.xColumns,
                        data, chartType, mobile, dark,
                        renderConfig: props.chartStyleCfg.renderChartConfig || {}
                    }} />;
            }
            let config
            try {
                config = getConfig(chartCp, data)
            } catch (ex: any) {
                console.warn('获取配置错误', ex)
                return renderErrorPrint(ex)
            }
            if (props.chartType === 'MAP' || props.chartType.toLowerCase().includes('map')) {
                return <EchartsMapView
                    key={props.dataRequest.chartId}
                    {...props} config={config} />
            }
            const components: Record<GraphRenderType, React.ElementType> = {
                echarts: EchartsView,
                antd: AntdChartView,
                uchart: UchartView
            }
            const Component = components[props.graphRenderType]
            return Component && <Component
                {...props}
                chartStyleCfg={chartStyleCfg}
                chartType={chartType}
                config={config} />;
        }
    }, [
        props.renderCode,
        dataResult?.data,
        chartType,
        props.chartStyleCfg?.showIndex,
        props.chartStyleCfg?.indexName,
        props.chartStyleCfg?.hidePagination,
        props.chartStyleCfg?.actions,
        props.chartStyleCfg?.pageSize,
        props.chartStyleCfg.sortedKeys,
        mobile, width, dark,
        props.chartStyleCfg.renderChartConfig,
        chartComponent
    ])

    return <>
        <div className=" w-full h-full relative chart-view" ref={ref}>
            {chartStyleCfg?.chartTypes?.length ?
                <div className="absolute right-4 top-0 chart-type-selector" style={{ zIndex: 500 }}>
                    <ChartTypeSelector
                        size={props.mobile ? 18 : 24}
                        xColumns={props.xColumns}
                        yColumns={props.yColumns}
                        value={[chartType]}
                        types={chartStyleCfg.chartTypes}
                        hover={false}
                        onChange={types => setChartType(types[0])}
                    />
                </div> : <></>}
            {((!props.chartStyleCfg.hideRefreshTip || !dataResult) && loading) && renderEmpty(<>
                <LoadingOutlined className=' text-4xl font-thin mb-2' />
                <div>数据加载中</div>
            </>)}
            <div className={classNames('h-full w-full relative',
                !props.chartStyleCfg.hideRefreshTip && loading && 'hidden'
            )}>
                {content}
            </div>
        </div >
    </>
}

export default ChartView