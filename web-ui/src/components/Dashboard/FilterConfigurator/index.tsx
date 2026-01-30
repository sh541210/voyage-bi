import BaseModal from "@/components/base/BaseModal"
import Items from "@/components/base/Items"
import { COMPONENT_VALUE_COUNT } from "@/constants"
import { COMPONENT_TYPE_LABEL, FILTER_TYPE_LABEL } from "@/constants/ChineseMapping"
import useList from "@/hooks/useList"
import { genKey, useFileNodes } from "@/utils/biz"
import { fixTreeSelect, recordToOptions } from "@/utils/common/common"
import { formatDateTime2 } from "@/utils/common/date"
import { renderChartNameWithParameters } from "@/utils/render"
import request from "@/utils/request"
import { Checkbox, Form, Input, message, Segmented, Select, Switch, Tabs, TreeSelect } from "antd"
import FormItem from "antd/es/form/FormItem"
import { useEffect, useMemo, useRef, useState } from "react"
import { getDefaultFormat } from "../Filters"

export const useFilterConfigurator = () => {
    const modalRef = useRef<any>(null)
    const [list, setList] = useState<FilterCfg[]>([])
    const [filters, setFilters] = useState<FilterCfg[]>()
    const [charts, setCharts] = useState<ChartVO[]>()
    const [onOkCallback, setOnOkCallback] = useState<(filters: FilterCfg[]) => Promise<any>>();
    return {
        contextHolder: useMemo(() => <BaseModal
            width={1000}
            height={400}
            ref={modalRef}
            title="配置筛选"
            onOk={() => {
                // 这里调用onOk
                onOkCallback && onOkCallback(list).then(() => {
                    message.success('修改成功！')
                    modalRef.current.close()
                })
            }}>
            <FilterConfigurator
                filters={filters}
                onChange={setList}
                charts={charts} />
        </BaseModal>, [charts, filters, list, onOkCallback]),
        open: (
            filters: FilterCfg[],
            charts: ChartVO[],
            onOk: (filters: FilterCfg[]) => Promise<any>
        ) => {
            // TODO 
            setFilters(JSON.parse(JSON.stringify(filters)))
            setCharts(charts)
            setOnOkCallback(() => onOk);
            modalRef.current.open()
        }
    }
}

interface FilterConfiguratorProps {
    filters?: FilterCfg[]
    charts?: ChartVO[]
    onChange: (list: FilterCfg[]) => void
}

const FilterConfigurator = (props: FilterConfiguratorProps) => {
    const { charts } = props
    const [list, { set, removeAt, updateAt, push }] = useList(props.filters || [])
    useEffect(() => {
        set(props.filters || [])
    }, [props.filters])

    useEffect(() => props.onChange(list), [list])
    return <Items<LabelItem & FilterCfg>
        title='筛选器'
        width={250}
        onAdd={() => {
            // @ts-ignore 这里可以为空
            push({
                key: `${genKey()}`,
                filterType: 'parameter',
                parameterMappings: {},
                optionsProps: { optionsType: 'static', treeSortColumns: [] },
                props: { showTitle: false, enabled: true }, fieldProps: {},
            })
        }}
        onRemove={removeAt}
        onReorder={set}
        list={list?.map(i => ({
            title: i.props?.title || formatDateTime2(Number(i.key)),
            ...i, labels: [FILTER_TYPE_LABEL[i.filterType], COMPONENT_TYPE_LABEL[i.componentType]]
        }))}
        renderContent={index => <ConfiguratorForm
            onChange={(consumer) => updateAt(index, consumer)}
            cfg={list[index]}
            charts={charts} />}
    />
}

const ConfiguratorForm = (props: {
    cfg: FilterCfg,
    onChange: (consumer: (cfg: FilterCfg) => void) => void,
    charts?: ChartVO[]
}) => {
    const { cfg, charts = [], onChange } = props
    const chartIds = Object.keys(cfg.parameterMappings).map(i => Number(i))
    const valueCount = cfg.componentType === 'cascader' ? (cfg.optionsProps.treeSortColumns?.length || 0) : COMPONENT_VALUE_COUNT[cfg.componentType]
    const valueLabel = valueCount > 1 || cfg.fieldProps.mode === 'multiple' ? '数组' : '值'
    const { treeSelectData: treeData, toNodeId, toRefId } = useFileNodes('dataSheet')
    const [columns, setColumns] = useState<DataSheetColumnVO[]>([])
    const columnOptions = columns.map(i => ({ label: i.desc || i.name, value: i.name }))
    const dataSheetId = cfg.optionsProps.dataSheetId
    const isOptionsComponent = ['select', 'treeSelect', 'radio', 'radioButton', 'segmented', 'cascader']
        .includes(cfg.componentType)
    const onOptionComponent = ['select', 'radio', 'radioButton', 'segmented']
        .includes(cfg.componentType)

    useEffect(() => {
        if (!dataSheetId) {
            return
        }
        request.GET<DataSheetColumnVO[]>(`/data-sheet/column/list?dataSheetId=${dataSheetId}`)
            .then(setColumns)
    }, [dataSheetId])

    return <div className="p-4 overflow-auto h-full relative bg-white dark:bg-antdDarkContainer">
        <Form variant='filled' labelCol={{ span: 3 }} labelAlign='left'>
            <FormItem label='打开/关闭'>
                <Switch
                    defaultValue={true}
                    value={cfg.props?.enabled}
                    onChange={value => onChange(i => i.props = { ...i.props, enabled: value })} />
            </FormItem>
            <FormItem label='筛选类型'>
                <Segmented
                    onChange={(e) => onChange(i => i.filterType = e)}
                    value={cfg.filterType}
                    options={recordToOptions(FILTER_TYPE_LABEL)
                        // TODO 数据集类型
                        .map(i => ({ ...i, disabled: i.value === 'dataSheet' }))
                    } />
            </FormItem>
            <FormItem label='组件类型' required>
                <Select placeholder='选择组件'
                    className="!w-[200px]"
                    onChange={(value: ComponentType) => {
                        onChange(i => i.componentType = value)
                    }}
                    value={cfg.componentType}
                    options={recordToOptions(COMPONENT_TYPE_LABEL)
                        .map(i => ({ ...i, label: `${i.label}「${COMPONENT_VALUE_COUNT[i.value]}个值」` }))
                    } />
                {onOptionComponent && <Segmented
                    className="!ml-[10px]"
                    defaultValue={cfg.optionsProps.optionsType ||
                        dataSheetId ? 'dynamic' : 'static'}
                    onChange={value => onChange(i => i.optionsProps.optionsType = value as OptionsType)}
                    value={cfg.optionsProps.optionsType} options={
                        [{ value: 'dynamic', label: '动态' },
                        { value: 'static', label: '静态' }]} />}
                {cfg.componentType === 'select' &&
                    <Segmented
                        className="!ml-[10px]"
                        value={cfg.fieldProps.mode || null}
                        onChange={value => onChange(i => i.fieldProps.mode = value)}
                        options={[
                            { value: null, label: '单选' },
                            { value: 'multiple', label: '多选' }]}
                    />}
                {cfg.componentType === 'dateRange' &&
                    <Segmented className="ml-2" value={cfg.props.showDateQuick || false} options={[
                        { value: true, label: '显示预设' },
                        { value: false, label: '不显示' }]}
                        onChange={value => onChange(i => i.props.showDateQuick = value)}
                    />}
                {cfg.componentType?.includes('date') &&
                    <Input className="ml-2 !w-[200px]"
                        placeholder='输入日期格式'
                        defaultValue={getDefaultFormat(cfg.componentType)}
                        value={cfg.props.dateFormat}
                        onChange={e => onChange(i => i.props.dateFormat = e.target.value)} />}
                {cfg.componentType === 'select' && <span className=" inline-flex items-center ml-2 text-sm">全部选项
                    <Switch className="ml-1" value={cfg.props.showAllOption || false}
                        onChange={value => onChange(i => i.props.showAllOption = value)}
                    /></span>}
            </FormItem>
            <FormItem label='组件标题'>
                <Switch value={cfg.props.showTitle || false}
                    onChange={value => onChange(i => {
                        i.props.showTitle = value
                    })} />
                {cfg.props.showTitle && <Input
                    className="!w-[200px] !ml-[10px]"
                    value={cfg.props.title}
                    onChange={e => onChange(i => i.props.title = e.target.value)}
                    placeholder='输入标题' />
                }
            </FormItem>
            {isOptionsComponent && (cfg.optionsProps.optionsType === 'dynamic' || cfg.componentType === 'treeSelect' || cfg.componentType === 'cascader') && <>
                <FormItem label='动态选项'>
                    <TreeSelect placeholder='选择数据集'
                        value={toNodeId(dataSheetId)}
                        className="!w-[200px]"
                        treeData={fixTreeSelect(treeData)}
                        treeDefaultExpandedKeys={[0]}
                        treeNodeFilterProp='title'
                        showSearch
                        onChange={nodeId => onChange(i => i.optionsProps = {
                            ...i.optionsProps, dataSheetId: toRefId(nodeId) as number
                        })} />
                    {dataSheetId && <>{['select', 'radio', 'radioButton'].includes(cfg.componentType) && <>
                        <Select placeholder='选择值字段'
                            value={cfg.optionsProps.valueColumn}
                            onChange={value => onChange(i => i.optionsProps.valueColumn = value)}
                            className="!w-[120px] !ml-[4px]"
                            options={columnOptions} />
                        <Select placeholder='选择显示字段'
                            value={cfg.optionsProps.labelColumn}
                            onChange={value => onChange(i => i.optionsProps.labelColumn = value)}
                            className="!w-[120px] !ml-[4px]"
                            options={columnOptions} />
                    </>}{(cfg.componentType === 'treeSelect' || cfg.componentType === 'cascader') && <Select
                        placeholder='字段顺序'
                        value={cfg.optionsProps.treeSortColumns}
                        onChange={value => onChange(i => i.optionsProps.treeSortColumns = value)}
                        className="!w-[240px] !ml-[4px]"
                        mode='multiple'
                        options={columnOptions} />}
                    </>}
                </FormItem>
            </>
            }
            {onOptionComponent &&
                cfg.optionsProps.optionsType === 'static' && <FormItem label='静态选项'>
                    <Select mode='tags'
                        value={cfg.optionsProps.staticOptions}
                        onChange={list => onChange(i => i.optionsProps.staticOptions = list)}
                        placeholder='自定义选项，输入后回车'
                        className="!max-w-[400px] !min-w-[200px]"
                    />
                </FormItem>}
            {cfg.componentType && <FormItem label='关联图表'>
                <Checkbox.Group<number>
                    options={charts.map(i =>
                    ({
                        label: renderChartNameWithParameters(`${i.name || '未命名图表'}[${i.id}]`),
                        value: i.id,
                        disabled: i.variableNames.length == 0
                    }))}
                    value={chartIds}
                    onChange={(values) => {
                        const updatedMappings = { ...cfg.parameterMappings };
                        // 添加在 values 中有但在 parameterMappings 中没有的 key
                        values.forEach(key => {
                            if (!(key in updatedMappings)) {
                                updatedMappings[key] = {}; // 设置空数组
                                const variables = charts.find(i => i.id === key)?.variableNames as string[]
                                if (valueCount > 1) {
                                    for (var i = 0; i < valueCount; i++) {
                                        const variable = variables?.[i]
                                        if (variable) {
                                            updatedMappings[key][variable] = i
                                        }
                                    }
                                } else {
                                    updatedMappings[key][variables?.[0]]
                                }
                            }
                        });
                        // 删除在 parameterMappings 中有但在 values 中没有的 key
                        Object.keys(updatedMappings).forEach(key => {
                            const numericKey = parseInt(key, 10);
                            if (!values.includes(numericKey)) {
                                delete updatedMappings[numericKey]; // 删除 key
                            }
                        });
                        onChange(i => i.parameterMappings = updatedMappings)
                    }}
                />
            </FormItem>}
            {chartIds.length > 0 && cfg.componentType && <Tabs size='small' tabBarStyle={{ margin: 0 }} className=" -mt-2" items={chartIds
                .map((chartId: number) => charts.find(chart => chart.id == chartId) as ChartVO)
                .filter(i => i)
                .map(chart => {
                    const mappings = cfg.parameterMappings[chart.id]
                    return ({
                        key: chart.id.toString(), label: renderChartNameWithParameters(`${chart?.name || '未命名图表'}[${chart.id}]`),
                        children: <>
                            {mappings && <div className="py-2 px-4 w-full relative items-center ">
                                {chart.variableNames.map(variable => <div key={variable} className="flex w-full relative items-center">
                                    <Checkbox onChange={e => {
                                        const map = cfg.parameterMappings
                                        if (e.target.checked) {
                                            map[chart.id][variable] = -1
                                        } else {
                                            delete map[chart.id][variable]
                                        }
                                        onChange(i => i.parameterMappings = map)
                                    }} checked={Object.keys(mappings).includes(variable)} />
                                    <div className="mx-2 !min-w-[100px]" >{variable}</div>
                                    <Segmented
                                        onChange={e => {
                                            onChange(o => o.parameterMappings[chart.id][variable] = e)
                                        }} value={mappings[variable]} options={[
                                            { value: -1, label: valueLabel },
                                            ...(valueCount === 1 ? [] : Array(valueCount).fill(0)
                                                .map((_, idx) => ({ value: idx, label: `${valueLabel}[${idx}]` })))]} />
                                </div>)}
                            </div>}
                        </>
                    })
                })} />}
        </Form>
    </div>
}
export default FilterConfigurator;