import BaseModal from "@/components/base/BaseModal"
import { ItemListForm } from "@/components/base/ItemList"
import Items from "@/components/base/Items"
import { MyIcon } from "@/components/base/MyIcon"
import { CHART_INTERACTION_LABEL } from "@/constants/ChineseMapping"
import useList from "@/hooks/useList"
import { genKey } from "@/utils/biz"
import { formatDateTime, formatDateTime2 } from "@/utils/common/date"
import { useCollapse } from "@/utils/render"
import { Cascader, Form, message, Segmented, Select, Switch } from "antd"
import FormItem from "antd/es/form/FormItem"
import { useEffect, useMemo, useRef, useState } from "react"

export const useChartInteractionConfigurator = () => {
    const modalRef = useRef<any>(null)
    const [list, setList] = useState<ChartInteractionCfg[]>([])
    const [cfgs, setCfgs] = useState<ChartInteractionCfg[]>()
    const [prop, setProp] = useState<{ charts: ChartVO[], groups: ChartGroupVO[], source?: string }>()
    const [onOkCallback, setOnOkCallback] = useState<(cfgs: ChartInteractionCfg[]) => Promise<any>>();
    return {
        contextHolder: useMemo(() => <BaseModal
            width={1200}
            height={600}
            ref={modalRef}
            title="联动配置"
            onOk={() => {
                // 这里调用onOk
                onOkCallback && onOkCallback(list).then(() => {
                    message.success('修改成功！')
                    modalRef.current.close()
                })
            }}>
            <ChartInteractionConfigurator
                {...prop}
                cfgs={cfgs}
                onChange={setList}
            />
        </BaseModal>, [prop, cfgs, list, onOkCallback]),
        open: (
            cfgs: ChartInteractionCfg[],
            charts: ChartVO[],
            groups: ChartGroupVO[],
            onOk: (cfg: ChartInteractionCfg[]) => Promise<any>,
            source?: string
        ) => {
            setCfgs(JSON.parse(JSON.stringify(cfgs)))
            setProp({ source, charts, groups })
            setOnOkCallback(() => onOk);
            modalRef.current.open()
        }
    }
}

interface ChartInteractionConfiguratorProps {
    cfgs?: ChartInteractionCfg[]
    charts?: ChartVO[]
    groups?: ChartGroupVO[]
    onChange: (list: ChartInteractionCfg[]) => void
    source?: string
}

const ChartInteractionConfigurator = (props: ChartInteractionConfiguratorProps) => {
    const { charts, groups } = props
    const [list, { set, removeAt, updateAt, push }] = useList(props.cfgs || [])

    useEffect(() => {
        set(props.cfgs || [])
    }, [props.cfgs])

    const getName = (key: string | null, cfg: ChartInteractionCfg) => {
        if (!key) return ''
        const splits = key.split('_') as string[]
        const obj: any = (splits[0] === 'chart' ? charts : groups)?.find(i => i.id === Number(splits[1]))
        return obj.name || obj.title || '-'
    }

    useEffect(() => props.onChange(list), [list])
    return <Items<Item & ChartInteractionCfg>
        title='联动'
        width={360}
        // @ts-ignore
        onAdd={() => push({
            key: `${genKey()}`,
            source: props.source || null, targetEvent: 'openChartModal'
        })}
        onRemove={removeAt}
        onReorder={set}
        list={list.map(i => ({
            ...i, title: <div>
                <div><span className="font-bold">联动对象：</span>{getName(i.source, i)}</div>
                <div><span className="font-bold">目标对象：</span>{getName(i.target, i)}</div>
                <div className="font-bold">创建日期：{formatDateTime(Number(i.key))}</div>
            </div>,
            labels: [CHART_INTERACTION_LABEL[i.sourceType],
            CHART_INTERACTION_LABEL[i.sourceEvent], CHART_INTERACTION_LABEL[i.targetEvent]].filter(i => i)
        }))}
        renderContent={(index, i) => <ConfiguratorForm
            onChange={consumer => updateAt(index, consumer)}
            cfg={i}
            source={props.source}
            charts={charts}
            groups={groups} />}
    />
}

interface ParameterMapping { key: string, value: string }

const ConfiguratorForm = (props: {
    cfg: ChartInteractionCfg,
    onChange: (consumer: (cfg: ChartInteractionCfg) => void) => void,
    charts?: ChartVO[]
    groups?: ChartGroupVO[]
    source?: string
}) => {
    const { cfg, charts = [], groups = [], onChange } = props
    const groupOptions = groups.map(i => ({
        value: `group_${i.id}`,
        label: <div className="flex items-center gap-1"><MyIcon name='group' />{i.title || '-'}「{i.id}」</div>
    }))
    const chartOptions = charts.map(i => ({
        value: `chart_${i.id}`,
        label: <div className="flex items-center gap-1"><MyIcon name='chart' />{i.name || '-'}「{i.id}」</div>
    }))
    const allOptions = [...groupOptions, ...chartOptions]
    const [values, setValues] = useState<string[]>([])
    const [parameterMappings, setParameterMappings] = useState<ParameterMapping[]>([])
    const { renderCollapse } = useCollapse()

    const getTargetOptions = (targetEvent: TargetEvent) => {
        if (targetEvent === 'switchGroupLabel') {
            return groupOptions
        } else if (targetEvent === 'openChartModal' || targetEvent === 'passParameters' || targetEvent === 'exportChartData') {
            return chartOptions
        }
    }

    useEffect(() => {
        onChange(i => (i as ParametersTarget).paramsMappings = parameterMappings.reduce((obj, item) => {
            obj[item.key] = item.value
            return obj
        }, {} as any))
    }, [values, parameterMappings])

    useEffect(() => {
        if (!cfg) {
            return
        }
        const mappings = (cfg as ParametersTarget).paramsMappings
        if (mappings) {
            let i = 1;
            const list = Object.keys(mappings).reduce((acc: ParameterMapping[], key: string) => {
                const value = mappings[key]
                acc.push({ key, value })
                return acc
            }, []);
            setParameterMappings(list)
            setValues(list.map(i => i.value).filter(i => i.startsWith('${') && i.endsWith('}')))
        }
    }, [cfg.key])

    const columns = useMemo(() => {
        const chartCfg = props.charts?.find(i => `chart_${i.id}` === cfg.source)?.cfg
        return !chartCfg ? [] : [...chartCfg.groupBy, ...chartCfg.values]
    }, [cfg.source])

    const targetVariables = useMemo(() => {
        return props.charts?.find(i => `chart_${i.id}` === cfg.target)?.variableNames || []
    }, [cfg.target])

    return <div className="p-2 overflow-auto h-full relative">
        <Form variant='filled'>
            {renderCollapse('联动-触发', <>
                <FormItem label='触发源事件' required>
                    <Cascader onChange={(values: string[]) => {
                        onChange(i => {
                            i.sourceType = values[0] as SourceType
                            i.sourceEvent = values[1] as SourceEvent
                        })
                    }} value={[cfg.sourceType, cfg.sourceEvent]}
                        options={[{
                            label: '默认', value: 'default', children: [{ label: '点击', value: 'onClick' }]
                        },
                        {
                            label: '表格', value: 'tableAction', children: [
                                { label: '点击', value: 'onClick' },
                            ]
                        }, {
                            label: '图表', value: 'graph', children: [{ label: '地图点击', value: 'mapClick' },
                            { label: '图点击', value: 'graphClick' }]
                        }, { label: '组', value: 'group', children: [{ label: '标签切换', value: 'tabChange' }] }]} />
                </FormItem>
                <FormItem label='触发源' required>
                    <Select options={allOptions} value={cfg.source}
                        disabled={!!props.source}
                        onChange={value => onChange(i => i.source = value)} />
                </FormItem>
                {cfg.sourceType === 'group' && <>
                    <FormItem label='标签'>
                        <Select value={(cfg as GroupSource).changedTab} options={
                            charts.filter(i => `group_${i.groupId}` === cfg.source)
                                .map(i => ({ value: i.id, label: i.name }))
                        } onChange={value => onChange(i => (i as GroupSource).changedTab = value)} />
                    </FormItem>
                </>}
                {cfg.sourceType === 'tableAction' && <>
                    <FormItem label='操作按钮'>
                        <Select value={(cfg as TableActionSource).actionIndex}
                            onChange={value => onChange(i => (i as TableActionSource).actionIndex = value)}
                            options={charts.find(i => `chart_${i.id}` === cfg.source)?.styleCfg?.actions?.map((i: string, idx: number) => ({ value: idx, label: i }))} />
                    </FormItem>
                </>}
                {/* <FormItem label='暴露参数'>
                        <Select onChange={setValues} mode='multiple' value={values}
                            options={columns.map(i => ({ label: i.alias || i.desc, value: `\$\{${i.alias || i.desc}\}` }))} />
                    </FormItem> */}
            </>)}
            {renderCollapse('联动-受控', <>
                <FormItem label='受控目标事件' required>
                    <Segmented value={cfg.targetEvent} onChange={value => {
                        onChange(i => {
                            i.target = null
                            const event = value as TargetEvent
                            i.targetEvent = event
                            if (event === 'openChartModal' || event === 'exportChartData') {
                                (i as OpenChartModalTarget | ExportChartDataTarget).hideChart = true
                                setParameterMappings([])
                            }
                        })
                    }} options={[
                        { value: 'openChartModal', label: '图表对话框' },
                        { value: 'switchGroupLabel', label: '切换组标签' },
                        { value: 'passParameters', label: '传递参数' },
                        { value: 'exportChartData', label: '导出图表数据' }
                    ]} />
                </FormItem>
                <FormItem label='受控目标' required>
                    <Select showSearch value={cfg.target} options={getTargetOptions(cfg.targetEvent)}
                        onChange={value => onChange(i => i.target = value)} />
                </FormItem>
                {cfg.targetEvent === 'switchGroupLabel' && <>
                    <FormItem label='标签'>
                        <Select value={cfg.tab} options={
                            charts.filter(i => `group_${i.groupId}` === cfg.target)
                                .map(i => ({ value: i.id, label: i.name }))
                        } onChange={value => onChange(i => (i as SwitchGroupLabelTarget).tab = value)} />
                    </FormItem>
                    <FormItem label='隐藏组标签'>
                        <Switch value={cfg.hideTabs}
                            onChange={value => onChange(i => (i as SwitchGroupLabelTarget).hideTabs = value)} />
                    </FormItem>
                </>}
                {(cfg.targetEvent === 'openChartModal' || cfg.targetEvent === 'exportChartData') && <>
                    <FormItem label='隐藏图表'>
                        <Switch value={cfg.hideChart}
                            onChange={value => onChange(i => (i as OpenChartModalTarget | ExportChartDataTarget).hideChart = value)} />
                    </FormItem>
                </>}
                {['openChartModal', 'passParameters', 'exportChartData']
                    .includes(cfg.targetEvent) && <FormItem label='传递参数'>
                        <ItemListForm
                            newForm={{ key: '', value: '' }}
                            list={parameterMappings}
                            columns={[{
                                dataIndex: 'key', title: '参数名',
                                valueType: 'select', fieldProps: {
                                    showSearch: true,
                                    options: targetVariables
                                        .map(i => ({ value: i, label: i }))
                                }
                            },
                            { dataIndex: 'value', title: '值', }]}
                            onListChange={setParameterMappings}
                        />
                    </FormItem>}
            </>)}
        </Form>
    </div>
}
export default ChartInteractionConfigurator;