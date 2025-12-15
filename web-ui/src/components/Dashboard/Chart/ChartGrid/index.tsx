import classNames from "classnames";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Layout } from "react-grid-layout";
import 'react-grid-layout/css/styles.css'
import Filters from "../../Filters";
import { deepMerge, replaceVariables } from "@/utils/common/common";
import { history, useModel } from "@umijs/max";
import { useChartWebSocket } from "@/hooks/websocket";
import { Badge } from "antd";
import ChartView from "../ChartView";
import CommonGridLayout from "@/components/base/CommonGridLayout";
import { useChartInteractionEventBus } from "@/components/ChartInteractionEventBus";
import Tabs from "@/components/base/Tabs";
import { MyIcons } from "@/components/base/MyIcon";
import { useDrillDowns } from "@/pages/Chart/Designer/drillDown";
import { getGroupType, getUpdateTime } from "@/utils/biz";

export type DisplayMode = 'develop' | 'design' | 'preview' | 'dev_preview'
export interface ChartGridPros {
    // 布局修改
    onLayoutChange: (layouts: Layout[]) => void
    // 删除图表
    onRemoveChart?: (chartId: number) => void
    // 导出图表
    onExportChart?: (chartId: number, name: string, parameters: Record<string, any>) => void
    // 复制图表
    onCopyChart?: (chartId: number) => void
    // 显示图表数据
    onShowData?: (chart: ChartVO, result: DataResult) => void
    // 设置图表筛选器
    onOpenChartFilter?: (chart: ChartVO) => void
    // 设置组筛选器
    onOpenGroupFilter?: (group: ChartGroupVO) => void
    // 设置图表联动
    onOpenChartInteraction?: (chartId: number) => void
    // 设置组联动
    onOpenGroupInteraction?: (groupId: number) => void
    // 图表集合
    charts: ChartVO[],
    // 图表组集合
    groups: ChartGroupVO[],
    // 图表样式配置
    dashboardStyleCfg?: DashboardStyleCfg
    // 布局配置
    layouts: Layout[]
    // 筛选器
    globalFilters: FilterCfg[]
    // 全局筛选器值
    globalFilterValues: any
    // 环境
    env?: string | null
    // 图表渲染代码
    chartRenderCode: string
    // 图表渲染类型
    graphRenderType: GraphRenderType
    // 展示模式
    displayMode: DisplayMode
    mode: Mode
    // 联动配置
    chartInteractionCfgs: ChartInteractionCfg[]
    shareKey: string | undefined
    dataMode?: DataMode
}

interface GridBase {
    key: string
    children: GridItem[]
}
type GridItem = (ChartGroupVO & GridBase) | (ChartVO & GridBase)

export const chartTabs = (groups: ChartGroupVO[], groupId: number | null, chartId: number) => {
    return groups.find(i => i.id === groupId)?.cfg.chartTabs?.find(i => i.chartIds.includes(chartId))
}

const groupCharts = (filter: boolean, charts: ChartVO[], groups: ChartGroupVO[],
    hideGroupIds: number[],
    innerChartIds: number[]): GridItem[] => {
    const gridItems: GridItem[] = charts
        // 分享界面不显示联动图表
        .filter(i => {
            return !filter || innerChartIds.length == 0 || !innerChartIds.includes(i.id)
        })
        // 不显示chartTabs中非首位的图表
        .filter(i => {
            const tabs = chartTabs(groups, i.groupId, i.id)
            return !tabs || tabs.chartIds[0] === i.id
        })
        .map(i => ({ ...i, key: 'chart_' + i.id, children: [] }))
    const groupItems: GridItem[] = groups.filter(i => {
        return !filter || !hideGroupIds.includes(i.id)
    }).map(i => ({
        ...i, key: 'group_' + i.id,
        children: gridItems.filter((j) => 'groupId' in j && j.groupId === i.id) as GridItem[]
    }))
    return [...gridItems.filter(i => 'groupId' in i && !i.groupId), ...groupItems]
}

const ChartGrid = (props: ChartGridPros) => {
    const { displayMode, mode, onLayoutChange, charts, layouts, env } = props
    const readOnly = displayMode !== 'develop'
    const previewMode = displayMode === 'preview'
    const mobile = mode === 'mobile'
    const [dataResults, setDataResults] = useState<Record<number, DataResult | undefined>>({})

    // 筛选器数据
    // const [filterValueRecord, setFilterValueRecord] = useState<Record<string, any>>()
    const [filterValues, setFilterValues] = useState<any>()
    // const updateValues = (key: string, values: any) => setFilterValueRecord(pre => ({ ...pre, [key]: values }))

    const { dataMode } = useModel('global')

    // 钻取
    const drill = useDrillDowns()
    // websocket获取数据接口
    const { fetchData } = useChartWebSocket(props.shareKey)

    // 联动相关
    const bus = useChartInteractionEventBus({
        ...props,
        onDataUpdate: (request, callback) => fetchData(request, callback)
    })

    // 隐藏图表ID集合
    const hideChartIds = useMemo(() => {
        // 组隐藏
        const hideGroupChartIds = props.groups
            .filter(i => props.dashboardStyleCfg?.hideGroupIds?.[mode]?.includes(i.id))
            .flatMap(i => i.chartIds)
        return [...hideGroupChartIds,
        // 弹窗隐藏
        ...bus.hideModalChartIds,
        // 图表隐藏
        ...(props.dashboardStyleCfg?.hideChartIds?.[mode] || [])]
    }, [bus.hideModalChartIds, charts, props.dashboardStyleCfg])

    // 隐藏图表组ID集合
    const hideGroupIds = useMemo(() => { return props.dashboardStyleCfg?.hideGroupIds?.[mode] || [] },
        [props.dashboardStyleCfg])

    // 更新全局筛选器值
    // useEffect(() => updateValues('global', props.globalFilterValues), [props.globalFilterValues])
    useEffect(() => setFilterValues((pre: any) => ({ ...pre, ...props.globalFilterValues })), [props.globalFilterValues])

    /**
     * 根据图表获取参数
     */
    const getParameters = useCallback((chart: ChartVO) => ({ ...getFilterParameterValues(chart, filterValues), ...bus.passParameterValues?.[chart.id] }), [filterValues, bus.passParameterValues])

    /**
     * 根据图表及值获取筛选器参数
     * @param chart 图表
     * @param filterValueRecord 筛选器值
     * @returns 参数
     */
    const getFilterParameterValues = (chart: ChartVO, filterValues: any) => {
        if (!filterValues) {
            return undefined
        }
        // let filterValues: any = {}
        // Object.keys(filterValueRecord).forEach((i) => {
        //     Object.keys(filterValueRecord[i]).forEach(k => {
        //         filterValues[k] = filterValueRecord[i][k]
        //     })
        // })
        const chartId = chart.id
        // 全局筛选器
        const globalFilters = props.globalFilters || []
        // 图表组筛选器
        const groupFilters = props.groups.find(i => i.chartIds.includes(chartId))?.cfg.filters || []
        // 图表筛选器
        const chartFilters = props.charts.find(i => i.id === chartId)?.cfg.filters || []
        // 所有筛选器
        const filters = [...globalFilters, ...groupFilters, ...chartFilters]
            // 过滤掉不包含当前图表的筛选器
            .filter(i => Object.keys(i.parameterMappings).map(i => Number(i)).includes(chartId))
        // 将筛选器和组件的值转化成参数
        return filters.reduce((parameter, cfg) => {
            // 找到对应关系
            const mappings = cfg.parameterMappings[chartId]
            // 遍历每个字段
            Object.keys(mappings).forEach(name => {
                // 根据筛选器名称找到实际值
                const filterValue = filterValues[cfg.key]
                // 值下标
                const idx = mappings[name]
                if (filterValue) {
                    // 设置字段及最终值，-1就是当前对象
                    parameter[name] = idx == -1 ? filterValue : filterValue[idx]
                }
            })
            return parameter
        }, {} as any)
    }
    // ------------------------------------------------------------------------------

    const renderChartOperations = (chartName: string, chart: ChartVO) => {
        return <MyIcons bgHover moreList={['link1', 'copy', 'delete', 'dataTable', 'down-xls']}
            size={readOnly ? 22 : 16} moreSize={readOnly ? 16 : 14} icons={[
                { name: "dataTable", title: '查看数据', visible: !mobile && readOnly, onClick: () => props.onShowData?.(chart, dataResults[chart.id] as DataResult) },
                { name: "edit", visible: !readOnly, onClick: () => history.push(`/chart/designer?chartId=${chart.id}`) },
                { name: "copy", title: '复制', visible: !readOnly, onClick: () => props.onCopyChart?.(chart.id) },
                { name: "filter", visible: !readOnly, onClick: () => props.onOpenChartFilter?.(chart) },
                { name: "delete", title: '删除', visible: !readOnly, onClick: () => props.onRemoveChart?.(chart.id) },
                { name: "down-xls", title: '下载表格', visible: readOnly, onClick: () => props.onExportChart?.(chart.id, chartName, getParameters(chart)) },
                { name: 'link1', title: '联动配置', visible: !readOnly, onClick: () => props.onOpenChartInteraction?.(chart.id) }
            ]} />
    }
    /**
     * 渲染网格项（组/图表）
     * @param item 网格项
     * @returns dom
     */
    const renderChart = (item: GridItem) => {
        if (item.key.startsWith('group')) {
            const charts = item.children as ChartVO[]
            const group = item as ChartGroupVO
            const showTitle = group.showTitle
            const time = getUpdateTime(charts.filter(i => i.groupId === group.id))
            return <div className={classNames("group/outer flex flex-col w-full h-full select-none bg-white dark:bg-antdDarkContainer relative consum overflow-hidden",
                // 自定义样式
                'grid-item-container chart-group-container ', group.title, `group-${group.id}`,
                readOnly ? 'readOnly rounded-sm' : 'shadow-sm hover:shadow-xl',
                hideGroupIds.includes(group.id) ? 'border-2 border-dashed dark:border-antdDarkBorder bg-yellow-50 dark:bg-gray-950' : ''
            )}>
                {/* 图表组工具栏 */}
                <div className="flex-wrap gap-1 z-50 absolute right-0 top-0 flex items-center 
                opacity-0 group-hover/outer:opacity-100 px-2 py-1 mr-1 mt-1 text-base bg-transparent actions-bar">
                    <MyIcons bgHover size={16} visible={!readOnly} icons={[
                        { name: 'filter', visible: !readOnly, onClick: () => props.onOpenGroupFilter?.(group) },
                        { name: 'link1', visible: !readOnly, onClick: () => props.onOpenGroupInteraction?.(group.id) }]} />
                </div>
                <div className={classNames('', group.styleCfg?.filterDisplay === 'inline' ?
                    'flex-row justify-between items-center' : 'flex-col items-start')}>
                    {/* 图表组标题 */}
                    <div className="flex items-center title-header">
                        {showTitle ? <div className={classNames('font-bold text-xl flex items-center title group-title',
                            !showTitle ? 'py-0 hidden' : 'ml-2')}>
                            {bus.icon(group.id, ' text-lg')}
                            {group.title || '未命名组'}
                        </div>
                            : <div className="absolute left-0" style={{ zIndex: 300 }}>
                                {bus.icon(group.id)}
                            </div>
                        }
                        {group.styleCfg?.showUpdateTime && <div className="ml-4 text-sm text-gray-500 time">
                            数据最新时间：{time}
                        </div>}
                    </div>
                    {group.cfg.filters?.length > 0 &&
                        <Filters name={`group-${group.id}`}
                            filters={group.cfg.filters}
                            lite={mobile}
                            onChange={values => setFilterValues((pre: any) => ({ ...pre, ...values }))}
                        // onChange={values => updateValues(`group-${group.id}`, values)}
                        />}
                </div>
                <div
                    className="w-full h-full relative overflow-hidden" style={{ flex: 1 }}>
                    {getGroupType(props.dashboardStyleCfg, group, mode) === 'GRID' ? renderChartGrid(layouts,
                        props.dashboardStyleCfg?.groupGridProps?.[mode]?.[group.id] ||
                        props.dashboardStyleCfg?.gridProps?.[mode],
                        item.children, onLayoutChange) :
                        <Tabs
                            onTabChange={value => bus.onTabChange(group.id, value)}
                            hidden={bus.tabHidden(group.id)}
                            ref={bus.tabsRefs.current[`group_${group.id}`]}
                            items={charts.map(i => ({
                                key: i.id,
                                title: <div style={{ height: '28px' }}
                                    className=" flex items-center">
                                    {bus.icon(i.id, 'pr-0.5 pl-0 text-lg block ')}
                                    {i.name || '未命名图表'}</div>,
                                content: renderChart(i as GridItem)
                            }))}
                        />
                    }
                </div>
            </div>
        } else {
            const chart = item as ChartVO
            const showTitle = chart.styleCfg?.showTitle
            const hide = hideChartIds.includes(chart.id)
            const individual = !chart.groupId
            const inTab = chart.groupId && (getGroupType(props.dashboardStyleCfg,
                props.groups.find(i => i.id === chart.groupId) as ChartGroupVO, mode)) === 'TAB'
            const chartName = replaceVariables(chart.name || '未命名图表', bus.passParameterValues?.[chart.id])
            if (!item.key.startsWith("chart_tabs")) {
                const chartTab = chartTabs(props.groups, chart.groupId, chart.id)
                if (chartTab?.chartIds[0] === chart.id) {
                    return <div id={chartName}
                        className={classNames('w-full h-full relative flex flex-col', `chart_${chart.id}`, 'chart_tabs')}>
                        {chartTab.showTitle && <div className="font-bold text-xl flex items-center mb-2"
                            style={{ flex: '0 0 20px' }}>{chartTab.name}</div>}
                        <div className="flex-1 w-full h-full relative overflow-hidden">
                            <Tabs
                                style={{ tab: { borderBottom: '0', fontSize: '14px' } }}
                                onTabChange={tab => bus.onInnerTabChange(chartTab.bindId,
                                    chartTab.chartIds.findIndex(i => i === tab))}
                                defaultItemKey={chart.id}
                                hidden={!chartTab.showTab}
                                ref={bus.tabsRefs.current[`chart_tabs_${chart.id}`]}
                                items={chartTab.chartIds.map(i => charts.find(j => j.id === i) as ChartVO)
                                    .filter(i => i).map(i => ({
                                        key: i.id, title: <div style={{ height: '28px' }}
                                            className=" flex items-center">
                                            {bus.icon(i.id, 'pr-0.5 pl-0 text-lg block ')}
                                            {i.name || '未命名图表'}</div>,
                                        content: renderChart({ ...i, key: 'chart_tabs_' + i.id } as GridItem)
                                    }))}
                            />
                        </div>
                    </div>
                }
            }
            const linkIcon = bus.icon(chart.id)
            const chartStyleCfg = deepMerge(props.dashboardStyleCfg?.chart, chart.styleCfg)
            return <div id={chartName} onClick={() => bus.itemOnClick(chart.id, 'chart', dataResults[chart.id]?.data)} key={`${chart.id}` + ''}
                className={classNames('flex flex-col w-full h-full relative bg-white dark:bg-antdDarkContainer group overflow-hidden rounded-sm',
                    // 自定义样式
                    'grid-item-container chart-container', chartName, `chart-${chart.id}`,
                    chart.groupId && !readOnly && 'border border-transparent',
                    !readOnly && !individual && !inTab && 'group-hover/outer:border-antdColorBorder dark:group-hover/outer:border-antdDarkBorder hover:bg-gray-50 dark:hover:bg-antdDarkColorFillQuaternary ',
                    !readOnly && !chart.groupId && ' shadow-sm hover:shadow-xl dark:shadow-neutral-800 dark:hover:shadow-neutral-900',
                    readOnly && 'readOnly',
                    hide ? 'border-2 border-dashed dark:border-antdDarkBorder bg-yellow-50 dark:bg-gray-950' : '')}>
                <div className={classNames(
                    'flex-wrap gap-1 z-50 absolute right-0 top-0 flex items-center opacity-0 group-hover:opacity-100 py-1 mr-1 mt-1 text-base bg-transparent overflow-hidden whitespace-normal pl-6 pr-2', 'actions-bar')}
                    style={{ height: '30px' }}>{renderChartOperations(chartName, chart)}</div>
                {(showTitle || chart.cfg.filters.length > 0 || linkIcon) &&
                    <div className={classNames('flex', chart.styleCfg?.filterDisplay === 'inline' ?
                        'flex-row justify-between items-center' : 'flex-col items-start')}
                        style={{ flex: showTitle ? '0 0 30px' : '' }}>
                        {showTitle ? <div className="flex items-center justify-between py-1 w-full title-header">
                            <span className={classNames('flex items-center ml-2 title font-bold text-md')}>
                                {!inTab && linkIcon}
                                {chart.columnNotFound && !readOnly ? <Badge dot>{chartName}</Badge> : chartName}
                            </span>
                        </div> :
                            (linkIcon ? <div className=" absolute left-0 flex items-center" style={{ zIndex: 300 }}>
                                {!inTab && linkIcon}
                            </div> : '')
                        }
                        <Filters name={`chart-${chart.id}`}
                            filters={chart.cfg.filters}
                            lite={mobile}
                            onChange={values => setFilterValues((pre: any) => ({ ...pre, ...values }))}
                        // onChange={values => updateValues(`chart-${chart.id}`, values)} 
                        />
                    </div>}
                {!previewMode && !showTitle && <div className="absolute left-4 bottom-4 opacity-0 group-hover:opacity-100 text-xl text-gray-400 dark:text-antdDarkColorFill">{chartName}</div>}
                <div className="w-full h-full relative overflow-hidden" style={{ flex: 1 }}>
                    <div className={classNames('chart-view-container h-full relative bg-transparent')}>
                        {filterValues && <ChartView
                            chartParameters={bus.passParameterValues?.[chart.id]}
                            chartId={chart.id}
                            onDataUpdate={(request, callback) => {
                                fetchData(request, dataResult => {
                                    setDataResults(i => ({ ...i, [chart.id]: dataResult }))
                                    callback(dataResult)
                                })
                            }}
                            onGraphEvent={(event) => {
                                bus.triggerGraphEvent(chart.id, event)
                                return drill.onGraphEvent(chart, event)
                            }}
                            graphRenderType={props.graphRenderType}
                            renderCode={props.chartRenderCode}
                            chartStyleCfg={displayMode === 'develop' ?
                                { ...chartStyleCfg, chartTypes: [] } : chartStyleCfg}
                            mobile={mobile}
                            yColumns={chart.cfg.values}
                            xColumns={chart.cfg.groupBy}
                            dataRequest={{
                                source: displayMode,
                                chartId: chart.id, env, shareKey: chart?.shareKey,
                                parameters: getParameters(chart),
                                dataMode: props.dataMode || dataMode,
                                drillDownParam: drill.drillDownParams[chart.id]
                            }}
                            onTableClick={(rowIndex, colIndex, actionIdx) => {
                                bus.tableActionOnClick(chart.id, rowIndex,
                                    actionIdx as number, dataResults[chart.id]?.data)
                            }}
                            chartType={mobile && chart.mobileType ? chart.mobileType : chart.type}
                        />}
                    </div>
                </div>
            </div>
        }
    }

    /**
     * 渲染图表网格
     * @param layouts 布局
     * @param charts 图表集合
     * @param onLayoutChange 布局变动回调
     * @returns dom
     */
    const renderChartGrid = (layouts: Layout[], gridProps: GridProps | undefined, charts: GridItem[],
        onLayoutChange: (layouts: Layout[]) => void) => {
        return <CommonGridLayout
            layout={layouts}
            spaceWidthX={gridProps?.spaceWidthX}
            spaceWidthY={gridProps?.spaceWidthY}
            cols={gridProps?.cols}
            rowHeight={gridProps?.rowHeight}
            isDraggable={!readOnly}
            isResizable={!readOnly}
            onResizeStop={(layout, _) => onLayoutChange(layout)}
            onDragStop={(layout, _) => onLayoutChange(layout)}
        >
            {charts?.map(i => (<div className={classNames('grid-container w-full h-full relative',
                readOnly ? 'readOnly' : '')}
                key={i.key}>
                {renderChart(i)}
            </div>))}
        </CommonGridLayout>
    }

    return <div style={{ paddingBottom: readOnly ? '' : '200px' }} className="w-full h-auto relative">
        {bus.modalContext}
        {renderChartGrid(layouts, props.dashboardStyleCfg?.gridProps?.[mode], groupCharts(readOnly,
            charts, props.groups, hideGroupIds, hideChartIds), onLayoutChange)}
    </div>
}

export default ChartGrid