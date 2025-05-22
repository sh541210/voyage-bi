import request from "@/utils/request"
import { Button, Form, InputNumber, Radio, Switch, Tabs, theme, Checkbox, Segmented } from "antd"
import FormItem from "antd/es/form/FormItem"
import { useEffect, useState } from "react"
import Dashboard from "../../../components/Dashboard"
import { useSearchParams } from "@umijs/max"
import { history } from "@umijs/max"
import SplitPane from "react-split-pane"
import { useObject } from "@/hooks"
import { GridType, requiedRulesInput, requiredRuleSelect } from "@/constants"
import { CodeEditor } from "@/components/base/Editor"
import { useTheme } from "@/components/setting/ThemeSelector"
import { useCollapse } from "@/utils/render"
import { GRID_TYPE_LABEL } from "@/constants/ChineseMapping"
import Kanban from "@/components/Kanban"
import { useModeSwitch } from ".."
import { ItemListForm } from "@/components/base/ItemList"
import { ThemeSwitch } from "@/components/setting/ThemeSwitch"

const DashboardDesigner = () => {
    const [chartChangeIds, setChartChangeIds] = useState<number[]>([])
    const [groupChangeIds, setGroupChangeIds] = useState<number[]>([])
    const [searchParams] = useSearchParams()
    const [splitSize, setSplitSize] = useState<number>(500)
    const dashboard = useObject<DashboardVO>()
    const { updateObject: update } = dashboard
    const { token } = theme.useToken()
    const { themeCfg, selectorContext } = useTheme()
    const { renderCollapse } = useCollapse()
    const { modeSwitch, renderContent, mode } = useModeSwitch()
    const [shares, setShares] = useState<DashboardShareVO[]>([])

    useEffect(() => {
        const dashboardId = searchParams.get('dashboardId')
        if (!dashboardId || isNaN(Number(dashboardId))) {
            history.push('/analysisView')
            return
        }
        request.GET<DashboardVO>(`/dashboard?id=${dashboardId}`).then(data => {
            if (data.type === 'KANBAN') {
                data.styleCfg.kanbanProp = data.styleCfg.kanbanProp ?? {
                    props: {
                        pc: { type: 'SEQUENCE' },
                        mobile: { type: 'SEQUENCE' }
                    }, items: []
                }
            }
            dashboard.setObject(data)
        })
        request.GET<DashboardShareVO[]>('/dashboard/share/list').then(setShares)
    }, [])


    const onChartChange = (chartId: number, consumer: (styleCfg: ChartStyleCfg) => void) => {
        setChartChangeIds([...chartChangeIds, chartId])
        update(i => i.charts = i.charts.map(i => {
            if (chartId === i.id) {
                consumer(i.styleCfg)
            }
            return i
        }))
    }

    const onGroupChange = (groupId: number, consumer: (styleCfg: ChartGroupStyleCfg) => void) => {
        setGroupChangeIds([...groupChangeIds, groupId])
        update(i => i.groups = i.groups.map(i => {
            if (groupId === i.id) {
                consumer(i.styleCfg)
            }
            return i
        }))
    }

    const renderRadioButtons = (list: (ChartVO | ChartGroupVO)[], type: GridType) => {
        list = list.filter(i => i.cfg.filters.length > 0)
        return list.length > 0 && renderCollapse(`${GRID_TYPE_LABEL[type]}筛选器位置`,
            list.map(i => <div className="mt-2" key={`${type}${i.id}}`}>
                {/* @ts-ignore */}
                {i.name || i.title}({GRID_TYPE_LABEL[type]})
                <Radio.Group defaultValue={'block'} value={i.styleCfg.filterDisplay}
                    optionType='button' className="ml-2"
                    onChange={e => {
                        type === 'chart' ? onChartChange(i.id, cfg => cfg.filterDisplay = e.target.value)
                            : onGroupChange(i.id, cfg => cfg.filterDisplay = e.target.value)
                    }}
                    options={[{ value: 'block', label: '下边' },
                    { value: 'inline', label: '右边' }]} />
            </div>))
    }
    const renderSwitchItem = (label: string, value: boolean | undefined, onChange: (value: boolean) => void) => {
        return <FormItem label={label}>
            <Switch value={value} onChange={onChange} />
        </FormItem>
    }

    const renderGridPropsForm = (value: GridProps | undefined, onChange: (value: GridProps) => void) => {
        return <>
            <FormItem label='间隔宽度'>
                <InputNumber min={1} max={30}
                    value={value?.spaceWidthX || 10}
                    onChange={spaceWidthX => {
                        spaceWidthX && onChange({ ...value, spaceWidthX })
                    }} />
                <InputNumber className="ml-2" min={1} max={30}
                    value={value?.spaceWidthY || 10}
                    onChange={spaceWidthY => {
                        spaceWidthY && onChange({ ...value, spaceWidthY })
                    }} />
            </FormItem>
            <FormItem label='列数'>
                <InputNumber min={10} max={40}
                    //  value={value?.cols}
                    value={value?.cols || 20}
                    onChange={cols => {
                        cols && onChange({ ...value, cols })
                    }} />
            </FormItem>
            <FormItem label='行像素'>
                <InputNumber min={1} max={30}
                    // value={value?.rowHeight}
                    value={value?.rowHeight || 20}
                    onChange={rowHeight => {
                        rowHeight && onChange({ ...value, rowHeight })
                    }} />
            </FormItem>
        </>
    }

    const renderCfgForm = (dashboard: DashboardVO) => {
        return <div className="overflow-auto h-full w-full relative">
            <Form variant='filled' size='small' >
                {renderCollapse('网格属性', <>
                    {renderGridPropsForm(dashboard.styleCfg.gridProps?.[mode], value => {
                        update(i => i.styleCfg.gridProps = { ...i.styleCfg.gridProps, [mode]: value })
                    })}
                </>)}
                {dashboard.type !== 'KANBAN' && <>
                    {renderRadioButtons(dashboard.charts, 'chart')}
                    {renderRadioButtons(dashboard.groups, 'group')}
                    {renderCollapse('数据更新时间显示', <>
                        {renderSwitchItem(dashboard.name, dashboard.styleCfg.showUpdateTime, value => update(i => i.styleCfg.showUpdateTime = value))}
                        {dashboard.groups.map(i =>
                            <div key={`show_update_time_${i.id}`}>
                                {renderSwitchItem(i.title, i.styleCfg.showUpdateTime, value => onGroupChange(i.id, i => i.showUpdateTime = value))}
                            </div>)}
                    </>)}
                    {dashboard.charts.length > 0 && renderCollapse('隐藏图表', <>
                        <Checkbox.Group value={dashboard.styleCfg.hideChartIds?.[mode]}
                            onChange={value => update(i => {
                                i.styleCfg.hideChartIds = { ...i.styleCfg.hideChartIds, [mode]: value }
                            })}
                            options={dashboard.charts.map(i =>
                                ({ value: i.id, label: `${i.name || '-'}(${i.id})` }))}>
                        </Checkbox.Group>
                    </>)}
                    {dashboard.groups.length > 0 && renderCollapse('隐藏组', <><Checkbox.Group value={dashboard.styleCfg.hideGroupIds?.[mode]}
                        onChange={value => update(i => {
                            i.styleCfg.hideGroupIds = { ...i.styleCfg.hideGroupIds, [mode]: value }
                        })}
                        options={dashboard.groups.map(i =>
                            ({ value: i.id, label: `${i.title || '-'}(${i.id})` }))}>
                    </Checkbox.Group>
                    </>)}
                    {mode === 'mobile' && dashboard.groups.length > 0 &&
                        renderCollapse('组类型', <>
                            {dashboard.groups.map(group =>
                                <FormItem label={group.title}>
                                    <Segmented
                                        size='small'
                                        defaultValue={dashboard.styleCfg.mobileGroupTypes?.[group.id] || group.groupType}
                                        key={group.id}
                                        options={[{ value: 'TAB', label: '标签' },
                                        { value: 'GRID', label: '网格' }]}
                                        onChange={value => update(i => {
                                            i.styleCfg.mobileGroupTypes =
                                                { ...i.styleCfg.mobileGroupTypes, [Number(group.id)]: value as GroupType }
                                        })}
                                    />
                                </FormItem>
                            )}
                        </>)}
                </>}
                {dashboard.type === 'KANBAN' && <>
                    {renderCollapse('组合配置', <>
                        <FormItem label='类型'>
                            <Segmented size='small' value={dashboard.styleCfg.kanbanProp.props[mode]?.type}
                                onChange={value => update(i => i.styleCfg.kanbanProp.props[mode].type = value as any)}
                                options={[{ value: 'TAB', label: '标签' }, { value: 'SEQUENCE', label: '顺序' }]} />
                            {dashboard.styleCfg.kanbanProp.props[mode]?.type === 'TAB' &&
                                <Segmented defaultValue='BOTTOM' className="ml-2" size='small' value={dashboard.styleCfg.kanbanProp.props[mode].tabPosition}
                                    onChange={value => update(i => i.styleCfg.kanbanProp.props[mode].tabPosition = value as any)}
                                    options={[{ value: 'TOP', label: '顶部' }, { value: 'BOTTOM', label: '底部' }]} />}
                        </FormItem>
                        <ItemListForm
                            list={dashboard.styleCfg.kanbanProp.items}
                            newForm={{ name: '', props: { showUpdateTime: false }, keys: [] }}
                            columns={[{ key: 'name', title: '名称', ...requiedRulesInput }, {
                                key: 'keys', title: '仪表盘', valueType: 'select',
                                ...requiredRuleSelect,
                                fieldProps: {
                                    mode: 'multiple', options: shares.filter(i => i.type !== 'KANBAN' && i.dashboardId !== dashboard.id)
                                        .map(i => ({ value: i.key, label: `${i.name}「${i.key}」` }))
                                }
                            }]}
                            onListChange={list => update(i => i.styleCfg.kanbanProp.items = list)}
                        />
                    </>)}
                </>}
            </Form>
        </div>
    }

    const renderCssEditor = (cfg: DashboardStyleCfg) => {
        return <CodeEditor
            options={{ minimap: { enabled: false } }}
            language={'less'}
            className="border h-full dark:border-antdDarkBorder"
            value={cfg.css || ''}
            onChange={value => update(i => i.styleCfg.css = value || '')} />
    }

    const renderDashboard = (dashboard: DashboardVO, themeConfig: ThemeVO) => {
        if (dashboard.type === 'KANBAN') return <Kanban theme={themeConfig} dashboard={dashboard} />
        return <Dashboard theme={themeConfig} dashboard={dashboard} displayMode='design' />
    }

    const onOk = async () => {
        await request.PUT(`/dashboard/style`, { ...dashboard.current })
        await dashboard.current?.charts.filter(i => chartChangeIds.includes(i.id)).forEach(async i => {
            await request.PUT('/chart/style', { ...i })
        })
        await dashboard.current?.groups.filter(i => groupChangeIds.includes(i.id)).forEach(async i => {
            await request.PUT('/chart/group/style', { ...i })
        })
    }
    const back = () => history.push('/analysisView')

    return dashboard.current && <div className="relative h-full w-full flex">
        {/* @ts-ignore */}
        <SplitPane
            pane1Style={{
                minWidth: '0px'
                // maxWidth: 'calc(100% - 1px)'
            }}
            split="vertical"
            size={splitSize}
            primary='second'
            minSize={240}
            maxSize={600}
            onChange={setSplitSize}
        >
            <div className="h-full relative w-full text-black dark:text-white p-2 bg-antdColorBgLayout dark:bg-antdDarkContainer"
                // style={{ backgroundColor: token.colorBgLayout }}
                >
                <div className="border border-gray-200 dark:border-antdDarkBorder h-full">
                    {themeCfg && renderContent(renderDashboard(dashboard.current, themeCfg))}
                </div>
            </div>
            <div className="h-full flex flex-col relative ">
                <Tabs
                    defaultActiveKey='conf' className="flex-1 h-full w-full px-4 pb-4 overflow-hidden"
                    items={[
                        { key: 'conf', label: '配置', children: renderCfgForm(dashboard.current) },
                        { key: 'css', label: '自定义样式', children: renderCssEditor(dashboard.current.styleCfg) }]}
                />
                <div className="flex justify-between p-2">
                    <div className="flex gap-2">
                        <ThemeSwitch />
                        {selectorContext}
                        {modeSwitch}
                    </div>
                    <div className="flex gap-2">
                        <Button size='small' type="primary" onClick={() => {
                            onOk().then(back)
                        }}
                        >完成</Button>
                        <Button size='small'
                            onClick={back}
                        >取消</Button>
                    </div>
                </div>
            </div>
        </SplitPane >
    </div >
}
export default DashboardDesigner;