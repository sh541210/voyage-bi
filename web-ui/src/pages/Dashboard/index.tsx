import TreeCommonLayout from "@/pages/base/TreeCommonLayout"
import request from "@/utils/request"
import { BarChartOutlined, BulbOutlined, FilterOutlined, FullscreenOutlined, GroupOutlined, LinkOutlined, PlusOutlined, ShareAltOutlined } from "@ant-design/icons"
import { JSX, useEffect, useState } from "react"
import { history } from "@umijs/max"
import Dashboard from "@/components/Dashboard"
import { useFilterConfigurator } from "@/components/Dashboard/FilterConfigurator"
import { useFileNodes } from "@/utils/biz"
import { useChartGroupModal } from "@/components/Dashboard/ChartGroup"
import { useChartInteractionConfigurator } from "@/components/Dashboard/ChartInteractionConfigurator"
import { fixTreeSelect, recordToObjectArray } from "@/utils/common/common"
import ShareListDrawer from "./ShareListDrawer"
import { DASHBOARD_TYPE_LABEL } from "@/constants/ChineseMapping"
import Kanban from "@/components/Kanban"
import MobileDesigner from "@/components/MobileDesigner"
import { useTheme } from "@/components/setting/ThemeSelector"
import { MyIcon } from "@/components/base/MyIcon"
import { message, Segmented } from "antd"
import { requiredRuleSelect } from "@/constants"
import { renderButton } from "@/utils/render"
import useExclusiveFullscreen from "@/hooks/fullScreen"
import SchemaForm from "@/components/base/SchemaForm"

export const useModeSwitch = () => {
    const [mode, setMode] = useState<Mode>('pc')
    return {
        mode,
        modeSwitch: <Segmented
            height={'100%'}
            options={['pc', 'mobile']
                .map(i => ({
                    value: i, label: <div className="px-1 py-1">
                        <MyIcon size={14} name={i} className='fill-black dark:fill-white' /></div>
                }))}
            size='small' className="mr-1"
            defaultValue={mode}
            onChange={e => setMode(e as Mode)} />,
        renderContent: (dom?: JSX.Element) => {
            return mode === 'mobile' ? <>
                <MobileDesigner >
                    {dom}
                </MobileDesigner>
            </> : <>{dom}</>
        }
    }
}

const DashboardPage = () => {
    const [dashboard, setDashboard] = useState<DashboardVO>()
    const { modeSwitch, renderContent } = useModeSwitch()
    const { treeSelectData, toRefId } = useFileNodes('dataSheet')
    const { open: openFilterConfigurator, contextHolder: globalFilterConfigModalContextHolder } = useFilterConfigurator()
    const { open: openChartGroupModal, contextHolder: chartGroupModelContextHolder, setDashboardId } = useChartGroupModal()
    const { open: openChartInteractionConfigurator, contextHolder: chartInteractionModalContextHolder } = useChartInteractionConfigurator()
    const { themeCfg, selectorContext } = useTheme()
    const { toggle, ref, isFullscreen } = useExclusiveFullscreen()
    // const {} = useLocalStorage('dev_mode', 'preview')
    // const [editLock, setEditLock] = useLocalStorage<boolean>('edit_lock', true)

    useEffect(() => {
        if (!dashboard) {
            return
        }
        setDashboardId(dashboard.id)
    }, [dashboard?.id])

    const renderDashboard = () => {
        if (!dashboard || !themeCfg) return
        if (dashboard.type === 'KANBAN') {
            return <div className="h-full w-full relative overflow-hidden">
                <Kanban theme={themeCfg} dashboard={dashboard} /></div>
        }
        return dashboard.charts.length > 0 ? <Dashboard
            theme={themeCfg}
            onOpenChartInteraction={chartId => {
                openChartInteractionConfigurator(dashboard.cfg.chartInteractionCfgs
                    .filter(i => i.source === `chart_${chartId}`),
                    dashboard.charts, dashboard.groups,
                    updateInteractions(dashboard, `chart_${chartId}`),
                    `chart_${chartId}`)
            }}
            onOpenGroupInteraction={groupId => {
                openChartInteractionConfigurator(dashboard.cfg.chartInteractionCfgs
                    .filter(i => i.source === `group_${groupId}`),
                    dashboard.charts, dashboard.groups,
                    updateInteractions(dashboard, `group_${groupId}`),
                    `group_${groupId}`)
            }}
            onOpenChartFilter={chart => {
                openFilterConfigurator(chart.cfg.filters, [chart], (filters) => {
                    return request.PUT('chart', { ...chart, cfg: { ...chart.cfg, filters } })
                        .then(() =>
                            setDashboard({
                                ...dashboard,
                                charts: dashboard.charts.map(i =>
                                    i.id !== chart.id ? i : ({ ...i, cfg: { ...i.cfg, filters } }))
                            }))
                })
            }}
            onOpenGroupFilter={group => {
                openFilterConfigurator(group.cfg.filters,
                    dashboard.charts.filter(i => group.chartIds.includes(i.id)),
                    (filters) => {
                        return request.PUT('/chart/group',
                            { ...group, cfg: { ...group.cfg, filters } })
                            .then(() => {
                                setDashboard({
                                    ...dashboard, groups: dashboard.groups.map(i =>
                                        i.id !== group.id ? i : ({ ...i, cfg: { ...i.cfg, filters } }))
                                })
                            })
                    })
            }}
            onCopyChart={chartId => request.POST(`/chart/copy/${dashboard.id}?chartId=${chartId}`).then((newChartId: number) => {
                message.success('复制成功！')
                // FIXME 复制筛选key重复问题
                const newChart: ChartVO = { ...dashboard.charts.find(i => i.id === chartId), id: newChartId, } as ChartVO
                const layoutCfg = dashboard.layoutCfg
                layoutCfg.pc.push({ ...layoutCfg.pc.find(i => i.i === `chart_${chartId}`), i: `chart_${newChartId}` })
                setDashboard({
                    ...dashboard,
                    charts: [...dashboard.charts, newChart], layoutCfg: { ...layoutCfg }
                })
                changeLayout({ ...layoutCfg })
            })}
            onRemoveChart={chartId => request.DELETE(`chart/${dashboard.id}?id=${chartId}`).then(() => {
                message.success('删除成功！')
                const idx = dashboard.charts.findIndex(i => i.id === chartId)
                setDashboard({
                    ...dashboard, charts: dashboard.charts.slice(0, idx)
                        .concat(dashboard.charts.slice(idx + 1))
                })
            })}
            // env={'default'}
            displayMode={isFullscreen ? 'dev_preview' : 'develop'}
            dashboard={dashboard}
            onLayoutChange={onLayoutChange} />
            : <div className="p-2 h-full">
                {renderCreateButton(<div className=" cursor-pointer p-10 border w-36 h-36 text-5xl
             text-gray-300 dark:text-gray-500  hover:text-gray-500 dark:hover:text-gray-100 dark:border-antdDarkBorder text-center bg-white dark:bg-antdDarkContainer rounded-sm">
                    <PlusOutlined />
                </div>)}
            </div>
    }

    const updateInteractions = (dashboard: DashboardVO, source?: string) =>
        (cfgs: ChartInteractionCfg[]) => {
            const left = dashboard?.cfg.chartInteractionCfgs
                .filter(i => source && i.source !== source)
            let chartInteractionCfgs = [...left, ...cfgs]
            return request.PUT(`/dashboard/cfg/${dashboard.id}`, { ...dashboard.cfg, chartInteractionCfgs })
                .then(() => setDashboard({ ...dashboard, cfg: { ...dashboard.cfg, chartInteractionCfgs } }))
        }

    const changeLayout = (layoutCfg: LayoutCfg) => request.PUT('/dashboard/layout', { id: dashboard?.id, layoutCfg })

    const onLayoutChange = (layoutCfg: LayoutCfg) => {
        dashboard && setDashboard({ ...dashboard, layoutCfg })
        changeLayout(layoutCfg)
    }

    const renderCreateButton = (triggerDom: JSX.Element) => {
        return <SchemaForm
            width={500}
            modalProps={{ destroyOnClose: true }}
            title='添加图表'
            layoutType='ModalForm'
            columns={[
                {
                    dataIndex: 'nodeId', title: '数据集',
                    valueType: 'treeSelect',
                    ...requiredRuleSelect,
                    fieldProps: {
                        showSearch: true,
                        treeDefaultExpandedKeys: [0],
                        treeNodeFilterProp: 'title',
                        treeData: fixTreeSelect(treeSelectData)
                    },
                }, {
                    dataIndex: 'groupId', title: '图表组', valueType: 'select',
                    fieldProps: {
                        showSearch: true, options: dashboard?.groups
                            .map(i => ({ value: i.id, label: i.title })),
                    }
                }]}
            grid={false}
            onFinish={async ({ nodeId, groupId }: any) => {
                if (!nodeId) {
                    message.error('未选择数据集')
                    return
                }
                request.POST('/chart', {
                    groupId, dataSheetId:
                        toRefId(nodeId),
                    dashboardId: dashboard?.id
                }).then(chartId => history.push(`/chart/designer?chartId=${chartId}`))
            }}
            trigger={triggerDom} />
    }

    const renderShareButton = () => dashboard && <ShareListDrawer dashboardId={dashboard.id}
        trigger={renderButton(<ShareAltOutlined key='分享' onClick={e => e.stopPropagation()} />)} />

    const getHeaderExtraButtons = (i: DashboardVO) => {
        const buttons = [
            renderButton(<BulbOutlined key='设计' onClick={() => history.push(`/dashboard/designer?dashboardId=${i.id}`)} />,),
            renderShareButton(),
            // <div onClick={() => setEditLock(!editLock)}
            //     className="px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-black dark:hover:bg-antdDarkColorFill rounded-sm" style={{ lineHeight: 1.57 }}>
            //     <MyIcon size={18} name={editLock ? 'lock' : 'unlock'} />
            // </div>
            renderButton(<FullscreenOutlined key='预览' onClick={toggle} />),
            selectorContext,
            modeSwitch,
        ]
        if (dashboard?.type !== 'KANBAN') {
            buttons.unshift(...[renderCreateButton(renderButton(<BarChartOutlined key='添加图表' />)),
            renderButton(<GroupOutlined key='图表组' onClick={() => openChartGroupModal(i.charts)} />),
            renderButton(<FilterOutlined key='全局筛选' onClick={() => openFilterConfigurator(i.cfg.filters, i.charts,
                (filters) => request.PUT(`/dashboard/cfg/${i.id}`, { ...i.cfg, filters })
                    .then(() => setDashboard({ ...i, cfg: { ...i.cfg, filters } })))} />),
            renderButton(<LinkOutlined key='联动配置' onClick={() => openChartInteractionConfigurator(i.cfg.chartInteractionCfgs, i.charts, i.groups,
                updateInteractions(i))} />)])
        }
        return buttons
    }

    return <>
        {chartGroupModelContextHolder}
        {chartInteractionModalContextHolder}
        <TreeCommonLayout<DashboardVO>
            hideLeftTree={false}
            bizType='dashboard'
            headerExtra={() => dashboard ? getHeaderExtraButtons(dashboard) : []}
            bizName="分析视图"
            createMenus={recordToObjectArray(DASHBOARD_TYPE_LABEL,
                (name, title) =>
                ({
                    title, icon: name,
                    valueMapper: i => ({ ...i, bizTypeExtra: name })
                }))}
            bizFetch={async (id: number) => request.GET<DashboardVO>(`/dashboard?id=${id}`)}
            renderContent={() => dashboard && <>
                <div ref={ref} className=" bg-inherit h-full w-full relative">
                    {renderContent(renderDashboard())}</div>
                <div key={'globalFilterConfigModal'}>{globalFilterConfigModalContextHolder}</div>
            </>}
            onFileSelect={setDashboard} /></>
}

export default DashboardPage