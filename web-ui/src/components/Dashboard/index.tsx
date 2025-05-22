import { useEffect, useMemo, useState } from "react"
import { useScrollRestoration, useMode } from "@/hooks";
import ChartGrid, { DisplayMode } from "./Chart/ChartGrid";
import { Layout } from "react-grid-layout";
import Filters from "./Filters";
import DataTable from "../base/DataTable";
import classNames from "classnames";
import { getUpdateTime } from "@/utils/biz";
import { displayResult } from "@/utils/common/common";
import { useLess } from "@/hooks/style";
import useModal from "@/hooks/useModal";

function mergeLayouts(layouts1: Layout[], layouts2: Layout[]): Layout[] {
    const layoutMap = new Map<string, Layout>();
    // 将 layouts1 和 layouts2 中的布局合并到 map 中
    [...layouts1, ...layouts2].forEach(layout => layoutMap.set(layout.i, layout));
    // 返回 map 中的布局数组
    return Array.from(layoutMap.values());
}

interface DashboardProps {
    dashboard: DashboardVO | DashboardSnapshotVO
    onLayoutChange?: (layoutCfg: LayoutCfg) => void
    onRemoveChart?: (chartId: number) => void
    onCopyChart?: (chartId: number) => void
    onExportChart?: (chartId: number, name: string, parameters: Record<string, any>) => void
    onOpenChartFilter?: (chart: ChartVO) => void
    onOpenGroupFilter?: (group: ChartGroupVO) => void
    // 设置图表联动
    onOpenChartInteraction?: (chartId: number) => void
    // 设置组联动
    onOpenGroupInteraction?: (groupId: number) => void
    initialValues?: any
    displayMode: DisplayMode
    defaultFilterParameters?: Record<string, any>
    setupGlobalFilterForm?: (records: Record<string, any>) => Record<string, any>
    env?: string | null
    theme: ThemeVO
    dataMode?: DataMode
}

const Dashboard = (props: DashboardProps) => {
    const { dashboard, displayMode, theme } = props
    const { ref, mode } = useMode()
    const [globalFilterValues, setGlobalFilterValues] = useState<Record<string, any>>()
    let setupGlobalFilterForm = props.setupGlobalFilterForm || (i => i)
    const dashboardStyleCfg = { ...theme?.dashboardStyleCfg, ...dashboard.styleCfg }
    useLess(theme.dashboardStyleCfg.css + 
        // (displayMode === 'develop' ? '' : 
            dashboardStyleCfg?.css)
        // )
    const [modal, modalContext] = useModal('show-data')
    const { scrollRef } = useScrollRestoration()

    useEffect(() => {
        let cfg: Layout[] = props.dashboard.layoutCfg[mode] || []
        const charts = props.dashboard.charts
        let y = 0;
        const add = (i: string, w: number, h: number, y: number) => {
            let item = cfg.find(j => j.i === i)
            if (!item) {
                item = {
                    i, h, w,
                    x: 0, y: y + h
                }
                cfg.push(item)
            }
            return item.y
        }
        props.dashboard.groups.forEach(i => {
            const children = charts.filter(j => j.groupId === i.id)
            let y2 = 0;
            children.forEach(j => {
                y2 = add(`chart_${j.id}` + '', mode === 'mobile' ? 20 : 4, 4, y2)
            })
            y = add(`group_${i.id}`, 20, y2 + 2, y)
        })
        charts.filter(i => !i.groupId).forEach(i => {
            y = add(`chart_${i.id}` + '', 6, 6, y)
        })
        props.dashboard.layoutCfg[mode] = [...cfg]
    }, [props.dashboard, mode])

    return <>{dashboard && <div ref={i => {
        ref.current = i
        i && (scrollRef.current = i)
    }}
        className={classNames('scrollbar-none overflow-x-hidden overflow-y-auto h-full w-full bg-transparent', mode,
            // 自定义样式
            'dashboard-container ', dashboard.type, mode)}>
        {displayMode !== 'develop' &&
            <div className={classNames('header relative font-bold flex flex-col items-center py-2')}>
                <div className={classNames('header-title flex items-end', mode === 'mobile' ? ' text-base' : 'text-2xl')}>
                    <span>{dashboard.name}</span>
                    {dashboard.styleCfg?.showUpdateTime && <span className={classNames('ml-4 text-gray-500 time', mode == 'mobile' ? ' text-xs' : 'text-sm')}>
                        数据最新时间: {getUpdateTime(dashboard.charts)}
                    </span>}
                </div>
            </div>
        }
        {<div className={classNames('filters flex items-center justify-between bg-white dark:bg-black box-border rounded-sm',
            (displayMode !== 'develop') ? '' : 'shadow-sm rounded-sm ',
            // 自定义样式
            'filters-container')}
            style={{ display: dashboard.cfg.filters.filter(i => i.props.enabled ?? true).length > 0 ? 'display' : 'none' }}>
            <Filters
                className="w-full h-full relative "
                name={`global-${dashboard.id}`}
                onChange={setGlobalFilterValues}
                initialValues={{ ...props.initialValues }}
                parameters={props.defaultFilterParameters}
                lite={mode === 'mobile'}
                filters={useMemo(() => dashboard.cfg.filters, [dashboard.cfg.filters])} />
        </div>}
        {dashboard.charts && theme && globalFilterValues && <ChartGrid
            shareKey={(dashboard as DashboardSnapshotVO).key}
            dataMode={props.dataMode}
            chartInteractionCfgs={dashboard.cfg.chartInteractionCfgs}
            onOpenChartInteraction={props.onOpenChartInteraction}
            onOpenGroupInteraction={props.onOpenGroupInteraction}
            onOpenChartFilter={props.onOpenChartFilter}
            onOpenGroupFilter={props.onOpenGroupFilter}
            onRemoveChart={props.onRemoveChart}
            onCopyChart={props.onCopyChart}
            onExportChart={props.onExportChart}
            graphRenderType={theme.graphRenderType}
            chartRenderCode={theme.renderCode}
            env={props.env}
            globalFilterValues={setupGlobalFilterForm(globalFilterValues)}
            globalFilters={dashboard.cfg.filters}
            charts={dashboard.charts}
            groups={dashboard.groups}
            layouts={dashboard.layoutCfg[mode]}
            dashboardStyleCfg={dashboardStyleCfg}
            displayMode={displayMode}
            mode={mode}
            onLayoutChange={layouts => {
                layouts = mergeLayouts(dashboard.layoutCfg[mode], layouts)
                const layoutCfg = dashboard.layoutCfg
                layoutCfg[mode] = layouts
                props.onLayoutChange?.(layoutCfg)
            }}
            onShowData={(chart, dataResult) => {
                modal.info({
                    title: displayResult(chart?.groupName, (chart.name || '未命名图表')),
                    icon: <></>,
                    content: <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
                        {dataResult && dataResult.success && dataResult.data &&
                            // TODO 这里没有处理message
                            <DataTable pagination={{ pageSize: 10, hidden: false }} size='small'
                                data={dataResult.data} />
                        }
                    </div>,
                    width: '80%',
                    closable: true,
                    maskClosable: true,
                    footer: null,
                    okButtonProps: { style: { display: "none" } }
                })
            }}
        />}
    </div >}{modalContext}</>
}

export default Dashboard