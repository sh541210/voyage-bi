import { CloseCircleFilled, SaveOutlined } from "@ant-design/icons"
import { Button, Collapse, Dropdown, Input, Tag, message } from "antd"
import { history, useModel, useSearchParams } from "@umijs/max"
import { useEffect, useState } from "react"
import request from "@/utils/request"
import { ReactSortable } from "react-sortablejs"
import classNames from "classnames"
import ChartView from "@/components/Dashboard/Chart/ChartView"
import { chartFunctions, dateFormats } from "@/constants"
import FormModal from "@/components/base/FormModal"
import ChartCfgForm from "@/components/Dashboard/Chart/ChartCfgForm"
import { theme as antTheme } from 'antd'
import { MyIcon, MyIcons } from "@/components/base/MyIcon"
import { ThemeSwitch } from "@/components/setting/ThemeSwitch"
import { CodeEditor } from "@/components/base/Editor"
import { useTheme } from "@/components/setting/ThemeSelector"
import { DataModeSwitch } from "@/components/setting/DataModeSwitch"
import { genKey, getSetupList, useFileNodes } from "@/utils/biz"
import { fixTreeSelect, recordToOptions, toggle2Array } from "@/utils/common/common"
import Tabs from "@/components/base/Tabs"
import { useDrillDowns } from "./drillDown"
import { ItemType } from "antd/es/menu/interface"
import { CONDITION_OPERATION_LABEL, DATE_FORMATS_LABEL, FUNCTION_NAME_LABEL } from "@/constants/ChineseMapping"
import useList, { ListActions } from "@/hooks/useList"
import { getHaveExpression, renderChartNameWithParameters, renderColumnLine, renderEmpty, renderSheetColumnTitle, renderToolTipTitle } from "@/utils/render"
import { useBatchModal } from "./BatchModal"
import { useChartWebSocket } from "@/hooks/websocket"
import useModal from "@/hooks/useModal"
import SchemaForm from "@/components/base/SchemaForm"

const activeClass = 'bg-primaryColor/10'
const readyClass = 'bg-gray-100 dark:bg-antdDarkColorFillQuaternary'

const ChartEditor = () => {
    const [searchParams] = useSearchParams()
    const [chart, setChart] = useState<ChartVO>()
    const [dataSheet, setDataSheet] = useState<DataSheetVO>()
    const [sheetColumns, setSheetColumns] = useState<DataSheetColumnSimpleVO[]>()
    const [columnfilterKeyWord, setColumnsFilterKeyWord] = useState<string>('')
    const [columnLineId, setColumnLineId] = useState<string>()
    const [x, xActions] = useList<ColumnLine>([])
    const [y, yActions] = useList<ColumnLine>([])
    const { token } = antTheme.useToken()
    const { themeCfg, selectorContext } = useTheme()
    const [modal, modalContextHolder] = useModal('code')
    const { dataMode } = useModel('global')
    const { treeSelectData, toRefId } = useFileNodes('dataSheet')
    const drill = useDrillDowns()
    const { systemConfig } = useModel('system')
    const filterSheetColumns = sheetColumns
        ?.filter(i => i.description?.includes(columnfilterKeyWord)
            || i.name.includes(columnfilterKeyWord))
    const { open, batchModalContext } = useBatchModal(sheetColumns)
    const { fetchData } = useChartWebSocket()

    const fetchChart = (chartId: number) => request.GET<ChartVO>(`/chart?id=${chartId}`)
        .then(data => setChart(data))
        .catch(msg => history.push('/analysisView'))

    useEffect(() => {
        const chartId = searchParams.get('chartId')
        if (!chartId || isNaN(Number(chartId))) {
            history.push('/analysisView')
            return
        }
        fetchChart(Number(chartId))
    }, [])

    useEffect(() => {
        if (!chart) {
            return
        }
        request.GET<DataSheetVO>(`data-sheet?id=${chart.dataSheetId}`).then(dataSheet => {
            setDataSheet(dataSheet)
        }).then(() => {
            request.GET<DataSheetColumnSimpleVO[]>(`data-sheet/column/list/simple?dataSheetId=${chart.dataSheetId}`).then(data => {
                setSheetColumns(data.sort((a, b) => {
                    if (a.columnType !== b.columnType) {
                        return a.columnType === 'METRIC' ? -1 : 1;
                    }
                    return b.id - a.id; // id 倒序
                }))
                const dataMap: Record<number, DataSheetColumnSimpleVO> = data.reduce((acc, cur) => {
                    acc[cur.id] = cur;
                    return acc;
                }, {} as Record<number, DataSheetColumnSimpleVO>);
                const fillProps = (list: Column[]) => {
                    return (list || []).map(i => dataMap[i.id] && { ...i, ...dataMap[i.id] })
                        .filter(i => i !== undefined);
                }
                xActions.set(fillProps(chart.cfg.groupBy))
                yActions.set(fillProps(chart.cfg.values))
            })
        }).catch(() => {
            history.push('/analysisView')
        })

    }, [chart?.dataSheetId])
    const drillDownParam = chart && drill.getDrillDownParam(chart.id)
    const getSheetColumn = (columnId?: number): DataSheetColumnSimpleVO | undefined => sheetColumns?.find(j => j.id === columnId)

    const openModal = (values: Condition) => {
        modal.confirm({
            title: '设置筛选',
            width: 600,
            onOk: () => { },
            content: <div className="flex flex-col">
                <SchemaForm<Condition>
                    labelCol={{ span: 3 }}
                    submitter={false}
                    initialValues={values}
                    // @ts-ignore
                    columns={(values: Condition) => {
                        const arr: any[] = [
                            { key: 'name', title: '字段名', readonly: true },
                            { key: 'desc', title: '名称', readonly: true }, {
                                key: 'operation', title: '操作', valueType: 'radioButton',
                                fieldProps: { options: recordToOptions(CONDITION_OPERATION_LABEL) }
                            }]
                        if (values.operation === 'EXPR') {
                            arr.push({
                                key: 'expression', title: '表达式', renderFormItem: () => <CodeEditor language="sql"
                                    className="h-36 border dark:border-antdDarkBorder"
                                    options={{
                                        minimap: { enabled: false },
                                        scrollbar: { horizontal: 'hidden' },
                                        lineNumbers: 'off'
                                    }} />
                            })
                        } else if (!values.operation.includes('NULL')) {
                            arr.push({ key: 'value', title: '值' })
                        }
                        return arr
                    }}
                />
            </div>
        })
    }

    const getBgClassName = (id: string) => {
        if (!columnLineId) return ''
        return columnLineId === id ? activeClass : readyClass
    }

    const columnDropdownMenuItems = (isMertric: boolean, column: ColumnLine, index: number, actions: ListActions<ColumnLine>): { items: ItemType[] | undefined, onClick: (menuInfo: any) => void } => {
        const getKey = (keyTitle: string): string => `${isMertric}-${keyTitle}-${column.key}-${index}`

        const onClick = (menuInfo: any) => {
        }

        const isDate = column.dataType === 'DATE'
        const tableChart = chart?.type === 'TABLE'
        const haveExpression = getHaveExpression(column)
        const items = [...(isDate ? [] : [{
            key: 'valueProps', label: <FormModal<ValueProps>
                initialValues={{ ...column.valueProps }}
                title={'数值显示格式'}
                uk={getKey('setFormat')} columns={[
                    {
                        dataIndex: 'percent', title: '百分比', valueType: 'segmented',
                        fieldProps: { options: [{ value: true, label: '显示' }, { value: false, label: '不显示' }] }
                    },
                    { dataIndex: 'digit', title: '小数位数', valueType: 'digit' },
                    {
                        dataIndex: 'numberSplit', title: '千分位分隔符', valueType: 'segmented',
                        fieldProps: { options: [{ value: true, label: '显示' }, { value: false, label: '不显示' }] }
                    },
                    { dataIndex: 'unit', title: '数值单位' }
                ]}
                onFinish={async formData => {
                    actions.updateAt(index, i => i.valueProps = formData)
                    return true
                }}
            />
        }]), ...(isDate ? [{
            key: 'date', label: '日期格式', children: dateFormats.map(format =>
            ({
                key: format,
                label: <div className={classNames(" relative w-full",
                    column.dateFormat === format ? 'text-primaryColor dark:text-primaryColor/90' : '')}
                    onClick={() => {
                        actions.updateAt(index, i => {
                            i.dateFormat = (column.dateFormat === format ? undefined : format);
                            i.dateFormatInterval = 1
                        })
                    }}>{DATE_FORMATS_LABEL[format]}</div>,
                children: [1, 3, 5, 7, 10, 15, 30, 45, 60].map(i => ({
                    key: i, label: <div className={classNames((column.dateFormatInterval || 1) === i
                        ? 'text-primaryColor dark:text-primaryColor/90' : '')}
                        onClick={() => {
                            actions.updateAt(index, j => j.dateFormatInterval = i)
                        }}>
                        {i}{DATE_FORMATS_LABEL[format]}
                    </div>
                }))
            }))
        }] : []), {
            key: 'alias', label: <FormModal
                title='别名'
                uk={getKey('setField')}
                initialValues={{ ...column }}
                columns={[{ title: '字段名', dataIndex: 'name', readonly: true },
                { title: '别名', dataIndex: 'alias' }]}
                onFinish={async (formData: any) => {
                    actions.updateAt(index, i => i.alias = formData.alias)
                    return true
                }} />
        }, ...(!tableChart ? [] : [{
            key: 'canBeSorted',
            label: <div className={classNames(' w-full', chart.styleCfg.sortedKeys?.includes(column.key) ? 'text-primaryColor dark:text-primaryColor/90' : '')}
                onClick={() => chart && setChart({ ...chart, styleCfg: { ...chart.styleCfg, sortedKeys: toggle2Array(chart.styleCfg.sortedKeys || [], column.key) } })}>支持排序</div>
        }]),
        ...(tableChart ? [{
            key: 'highlight', label: '高亮', children: systemConfig?.tableHighlights
                .map(i => ({
                    disabled: !i.dataTypes?.includes(column.dataType),
                    key: i.name, label: <div className={classNames('w-full',
                        ((chart.styleCfg.highlights as any)?.[i.name])?.includes(column.key) ? 'text-primaryColor dark:text-primaryColor/90' : '')}
                        onClick={() => {
                            const highlights: any = chart.styleCfg.highlights || {}
                            highlights[i.name] = toggle2Array(highlights[i.name] || [], column.key)
                            chart && setChart({ ...chart, styleCfg: { ...chart.styleCfg, highlights } })
                        }}>{i.label}</div>
                }))
        }] : []), {
            key: 'sort', label: '排序',
            children: [...[
                { key: 'default', orderBy: undefined, label: '默认' },
                { key: 'asc', orderBy: 'ASC', label: '升序' },
                { key: 'desc', orderBy: 'DESC', label: '降序' }]
                .map(i => ({
                    key: i.key,
                    label: <div className={classNames('w-full',
                        i.orderBy === column.sort?.orderBy ? 'text-primaryColor dark:text-primaryColor/90' : '')}
                        onClick={() => {
                            actions.updateAt(index, c => c.sort = { ...c.sort, key: column.key, name: column.name, orderBy: i.orderBy as SortOrderBy })
                            chart && setChart({ ...chart, cfg: { ...chart.cfg, sortKey: i.key === 'default' ? undefined : column.key } })
                        }}>{i.label}</div>
                })), ...(column.dataType !== 'TEXT' ? [] : [{
                    key: 'custom',
                    label: <FormModal
                        size='small'
                        onFinish={async (formData: any) => {
                            actions.updateAt(index, c => c.sort = { ...c, ...formData, custom: true })
                            return true
                        }}
                        initialValues={{ values: column.sort?.values }}
                        title='自定义排序' columns={[{
                            dataIndex: 'values', title: '值顺序', valueType: 'select', request: async () =>
                                (await request.GET<string[]>(`/data-sheet/column/values?dataSheetId=${dataSheet?.id}&columnId=${column.id}`))
                                    .map(i => ({ value: i, label: i })),
                            fieldProps: { mode: 'multiple' }
                        }]} />
                }])]
        },
        ...(isMertric ? [...chartFunctions.map(fuc => ({
            key: fuc,
            disabled: haveExpression,
            label: <div className={classNames('w-full',
                !haveExpression && fuc === column.func
                    ? 'text-primaryColor dark:text-primaryColor/90' : '')}
                onClick={() => {
                    actions.updateAt(index, i => i.func = fuc)
                }}>
                {FUNCTION_NAME_LABEL[fuc]}</div>,
        }))] : []),
        {
            key: 'expression',
            label: <FormModal
                title='自定义表达式'
                width={800}
                labelCol={{ span: 3 }}
                uk={getKey('setField')}
                trigger={<div className={haveExpression ?
                    'text-primaryColor dark:text-primaryColor/90' : ''}>表达式</div>}
                initialValues={{ ...column }}
                columns={[{ title: '字段名', dataIndex: 'name', readonly: true },
                {
                    title: '表达式', dataIndex: 'expression',
                    renderFormItem: () => <CodeEditor language="sql"
                        className="h-36 border dark:border-antdDarkBorder"
                        options={{
                            minimap: { enabled: false },
                            scrollbar: { horizontal: 'hidden' },
                            lineNumbers: 'off'
                        }} />,
                }]}
                onFinish={async (formData: any) => {
                    actions.updateAt(index, i => i.expression = formData.expression)
                    return true
                }} />
        }, ...(tableChart ? [{
            key: 'hideColumn',
            label: '隐藏',
            children: [{ name: 'mobile', key: '移动端' }, { name: 'pc', key: 'PC' }].map(i => ({
                ...i, label: <div className={classNames('flex items-center gap-2',
                    chart.styleCfg.tableHideKeys?.[i.name]?.includes(column.key) ? 'text-primaryColor dark:text-primaryColor/90' : '')} onClick={() => {
                        chart && setChart({
                            ...chart, styleCfg: { ...chart.styleCfg, tableHideKeys: { ...chart.styleCfg.tableHideKeys, [i.name]: toggle2Array(chart.styleCfg.tableHideKeys?.[i.name] || [], column.key) } }
                        })
                    }}><MyIcon className={classNames(chart.styleCfg.tableHideKeys?.[i.name]?.includes(column.key) ? 'fill-primaryColor dark:fill-primaryColor/90' : '')} name={i.name} />
                    {i.key}
                </div>
            }))
        }] : [])]
        return { items: items as ItemType[], onClick }
    }

    const renderColumnClines = (isMetric: boolean, list: ColumnLine[], actions: ListActions<ColumnLine>) => {
        const title = isMetric ? '指标' : '维度'
        return <div className={classNames('h-[60px] w-full column-lines flex items-center flex-row dark:border-antdDarkBorder border-b p-2 overflow-hidden',
            getBgClassName(title),
        )}>
            <div className="ml-1 w-[40px] text-gray-600 text-sm font-bold select-none dark:text-gray-200">{title}</div>
            <ReactSortable
                id={title}
                ghostClass="column-line"
                className='flex-1 flex flex-nowrap flex-row items-center h-full w-full overflow-x-auto overflow-y-hidden gap-2'
                direction='vertical'
                group={{ name: 'columns', 'pull': () => true }}
                removeCloneOnHide={true}
                list={list}
                setList={(list, a, b) => b.dragging && actions.set(getSetupList(list, isMetric))}
            >{list.map((column, idx) => {
                return <div id={title} key={`${title}-${idx}`} ><Dropdown trigger={['hover']}
                    menu={{ ...columnDropdownMenuItems(isMetric, column, idx, actions) }}>
                    {chart && <div className={classNames('group flex flex-row relative pl-2 pr-2 py-1.5 shadow-md bg-primaryColor text-white rounded-sm cursor-pointer text-sm flex-shrink-0')}>
                        <div className="flex items-center flex-nowrap" onClick={(e) => e.preventDefault()}>
                            <MyIcon className=" fill-white mr-1" name='down' />
                            {renderColumnLine(chart?.cfg.sortKey, column)}
                            <CloseCircleFilled onClick={() => {
                                actions.removeAt(idx)
                            }} className="text-lg ml-1 opacity-0 group-hover:opacity-100 hover:text-blue-400" />
                        </div>
                    </div>}
                </Dropdown></div>
            })}</ReactSortable>
            <div className="w-[30px] ml-1 flex justify-center">
                <MyIcons bgHover size={18} moreSize={14} icons={[{
                    name: 'edit', title: '批量处理', onClick: () => open(title, list, chart?.cfg.sortKey, isMetric,
                        (list) => actions.set(list))
                }, { name: 'delete', title: '清除全部', onClick: () => actions.set([]) }]}
                    moreList={['edit', 'delete']} />
            </div>
        </div >
    }

    return <>
        {modalContextHolder}
        {batchModalContext}
        {chart && <div className="h-screen w-screen overflow-hidden relative flex flex-col" style={{ backgroundColor: token.colorBgContainer }}>
            <div className=" grow-0 shrink-0 h-[45px] dark:border-antdDarkBorder border-b px-2 flex items-center justify-between">
                <Button className="mr-2 h-[45px]" onClick={() => {
                    history.push(`/analysisView?id=${chart.dashboardId}`, { locate: true })
                }} type='text' size="large" icon={<MyIcon size={22} className="-mr-1 inline-flex fill-gray-500 dark:fill-gray-300" name='left' />} >
                    编辑{renderChartNameWithParameters(chart.name) || '未命名图表'}</Button>
                <div className="flex flex-row items-center gap-3 h-full justify-start mr-2">
                    {selectorContext}
                    <DataModeSwitch className="h-full inline-flex" />
                    <ThemeSwitch className="h-full inline-flex" />
                    <Button
                        className="h-full inline-flex"
                        icon={<SaveOutlined />}
                        type='text'
                        onClick={() => {
                            chart.cfg.values = y
                            chart.cfg.groupBy = x
                            request.PUT('/chart', chart).then(data => {
                                message.success('保存成功！')
                                history.push('/analysisView')
                            })
                        }} >保存</Button>
                </div>
            </div>
            <div className="flex-1 min-h-0 w-full relative flex flex-row items-center text-gray-600 dark:text-gray-200">
                <div className="w-[240px] h-full relative flex flex-col dark:border-antdDarkBorder border-r">
                    <div className="grow-0 shrink-0 py-2 basis-[72px]">
                        <div className="px-2 mb-1 text-sm font-bold text-black dark:text-white">数据集</div>
                        <div className=" px-2 py-1 w-full flex justify-between text-sm items-center ">
                            <span className="text-ellipsis whitespace-nowrap overflow-hidden w-[160px]">{dataSheet && renderToolTipTitle(dataSheet.name, dataSheet.description)}</span>
                            <div className="flex items-center gap-1">
                                <MyIcons bgHover size={18} itemClassName="h-full anticon cursor-pointer"
                                    moreList={['switch']} icons={[{
                                        title: '', name: 'edit', size: 14, onClick: () => history.push(`/dataSheet?id=${dataSheet?.id}&mode=dev`)
                                    }, {
                                        title: '', name: 'code', onClick: () => modal.info({
                                            title: `${dataSheet?.name}`,
                                            width: '70%',
                                            content: <div className="flex flex-col h-[600px]">
                                                <CodeEditor
                                                    className="flex-1 border dark:border-antdDarkBorder"
                                                    options={{ readOnly: true }}
                                                    language="sql"
                                                    value={dataSheet?.sqlText} />
                                            </div>
                                        })
                                    }, {
                                        name: 'switch', visible: true, title: icon => {
                                            return <FormModal columns={[{
                                                dataIndex: 'nodeId', title: '数据集',
                                                valueType: 'treeSelect',
                                                fieldProps: {
                                                    showSearch: true,
                                                    treeDefaultExpandedKeys: [0],
                                                    treeNodeFilterProp: 'title',
                                                    treeData: fixTreeSelect(treeSelectData)
                                                },
                                            }]}
                                                title='切换数据集'
                                                trigger={<div>{icon}切换数据集</div>}
                                                onFinish={async ({ nodeId }: any) => {
                                                    if (!nodeId) {
                                                        message.error('未选择数据集')
                                                        return
                                                    }
                                                    await request.PUT(`/chart/sheet/${chart.id}/${toRefId(nodeId)}`)
                                                        .then(() => fetchChart(chart.id))
                                                    message.success('数据集切换成功！')
                                                    return true
                                                }}
                                            />
                                        },
                                    }]} />
                            </div>
                        </div>
                    </div>
                    <div className="dark:border-antdDarkBorder border-t overflow-hidden flex-1 min-h-0">
                        <Tabs className="pb-2 pt-1"
                            style={{ outer: { height: '100%', position: 'relative' }, tab: { fontSize: '14px', padding: '6px 4px' } }}
                            defaultItemKey='字段'
                            items={[{
                                title: '字段', key: '字段', content: <div className="flex flex-col h-full relative">
                                    <div className="flex-1 min-h-0 px-2 relative text-sm overflow-hidden">
                                        <div className="py-2 h-[40px]">
                                            <Input size='small' variant='filled' placeholder="输入列名或者描述"
                                                value={columnfilterKeyWord} onChange={e => setColumnsFilterKeyWord(e.target.value)} />
                                        </div>
                                        {filterSheetColumns && <div
                                            className="overflow-auto flex-1 relative h-full">
                                            <ReactSortable
                                                className="flex flex-col gap-1 items-start"
                                                id={'sheetColumns'}
                                                sort={false}
                                                group={{ name: 'columns', 'pull': 'clone', put: false }}
                                                onStart={() => {
                                                    setColumnLineId('start')
                                                }}
                                                onMove={(evt) => {
                                                    setColumnLineId(evt.related.id)
                                                    if (evt.related.id) {
                                                        return true
                                                    }
                                                    return false
                                                }}
                                                onEnd={() => {
                                                    setColumnLineId(undefined)
                                                }}
                                                list={filterSheetColumns}
                                                setList={() => { }}
                                            >{filterSheetColumns
                                                .map(i => <div className="flex cursor-pointer pl-2 pr-2 py-1.5 items-center bg-white dark:bg-antdDarkContainer text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:font-semibold select-none whitespace-nowrap text-ellipsis overflow-hidden w-auto"
                                                    key={i.id}>
                                                    <MyIcon size={16} className="mr-2 fill-primaryColor dark:fill-primaryColor/90 " name={i.dataType} />
                                                    {renderSheetColumnTitle(i)}
                                                </div>)}
                                            </ReactSortable>
                                        </div>}
                                    </div>
                                    <div className={classNames(' basis-[300px] dark:border-antdDarkBorder border-t pt-2',
                                        getBgClassName('筛选器')
                                    )}>
                                        <div className=" text-black text-antdDarkColorFillSecondary dark:text-gray-200 font-bold text-sm px-2">筛选器</div>
                                        <ReactSortable
                                            id={'筛选器'}
                                            className={'h-full relative p-2'}
                                            direction='vertical'
                                            group={{ name: 'columns', 'pull': () => true }}
                                            list={chart.cfg.conditions || []}
                                            onAdd={(evt) => {
                                                if (evt.oldIndex && filterSheetColumns?.[evt.oldIndex]) {
                                                    const column = filterSheetColumns?.[evt.oldIndex]
                                                    const values = {
                                                        key: genKey(), id: column.id,
                                                        desc: column.desc, operation: 'EXPR',
                                                        name: column.name
                                                    } as Condition
                                                    openModal(values)
                                                }
                                            }}
                                            setList={() => { }}
                                        >
                                            {sheetColumns && chart.cfg.conditions.map((i: Condition) => {
                                                const column = getSheetColumn(i.id)
                                                return <div className=" text-sm rounded-sm" key={i.id || i.name}>
                                                    <Collapse
                                                        size='small'
                                                        bordered={false}
                                                        expandIcon={({ isActive }) => <MyIcon className=" fill-gray-500"
                                                            name={isActive ? 'down' : 'right'} />}
                                                        style={{ background: token.colorBgContainer, userSelect: 'none' }}
                                                        items={[{
                                                            key: i.key, label: column?.desc, children: <div onClick={() => openModal({ ...column, ...i })} className="bg-antdColorBgLayout dark:bg-antdDarkColorFillTertiary -mt-1 p-2 text-xs hover:bg-gray-100 dark:hover:bg-antdDarkColorFillSecondary cursor-pointer rounded-sm">
                                                                {i.expression || <div>
                                                                    <span className=" font-bold text-sm mr-1">{CONDITION_OPERATION_LABEL[i.operation]} </span>
                                                                    <span className="underline ">{i.value}</span>
                                                                </div>}
                                                            </div>
                                                        }]}
                                                    />
                                                </div>
                                            })}
                                        </ReactSortable>
                                    </div>
                                </div>
                            },
                            {
                                title: '变量', key: '变量',
                                content: <div className="flex flex-col h-full relative">
                                    <ReactSortable
                                        sort={false}
                                        group={{ name: 'variableSortable', 'pull': 'clone', put: false }}
                                        list={dataSheet?.variableNames.map(i => ({ id: i })) || []}
                                        setList={() => { }}
                                        className="flex-1 px-4 overflow-hidden flex flex-col gap-4">
                                        {(dataSheet?.variableNames.length || 0) > 0 ?
                                            dataSheet?.variableNames.map(i => <div className="text-sm cursor-pointer select-none hover:font-bold" key={i}>{i}</div>) :
                                            renderEmpty('暂无变量', ' text-sm')}
                                    </ReactSortable>
                                    <div className=" basis-[300px] text-gray-500 dark:text-gray-200 text-sm rounded-sm dark:border-antdDarkBorder border-t pt-2">
                                        <div className="text-black text-antdDarkColorFillSecondary dark:text-gray-200 mb-2 font-bold text-sm px-2">默认参数</div>
                                        <ReactSortable
                                            group={{ name: 'variableSortable', 'pull': () => true }}
                                            list={Object.entries(chart.cfg.parameterConditions)?.map(([name, value]) => ({ id: name, name, value }))}
                                            setList={() => { }}
                                            className="mt-2 flex flex-col px-2">
                                            {Object.keys(chart.cfg.parameterConditions).map(i => <div key={i}>
                                                <Tag>{i}</Tag>
                                                等于<Tag className="ml-2">{(chart.cfg.parameterConditions as any)[i]}</Tag>
                                            </div>)}
                                        </ReactSortable>
                                    </div>
                                </div>
                            }]}
                        />
                    </div>
                </div>
                <div className="h-full flex-1 min-w-0 flex flex-col relative">
                    <div className='h-[120px] dark:border-antdDarkBorder'>
                        {renderColumnClines(true, y, yActions)}
                        {renderColumnClines(false, x, xActions)}
                    </div>
                    <div style={{
                        background: token.colorBgLayout
                    }} className="w-full p-4 flex-1 min-h-0 flex flex-col">
                        {themeCfg && chart.type ? <ChartView
                            onDataUpdate={fetchData}
                            dataRequest={{
                                source: 'develop',
                                chartId: chart.id,
                                //  env: 'default',
                                shareKey: chart?.shareKey,
                                preview: true,
                                dataMode,
                                parameters: {},
                                chartCfg: { ...chart.cfg, values: y, groupBy: x },
                                drillDownParam: drillDownParam,
                            }}
                            chartId={chart.id}
                            onGraphEvent={(event: any) => drill.onGraphEvent(chart, event)}
                            graphRenderType={themeCfg.graphRenderType}
                            renderCode={themeCfg.renderCode}
                            mobile={false}
                            yColumns={y}
                            xColumns={x}
                            chartType={chart.type}
                            chartStyleCfg={{ ...chart.styleCfg, autoScroll: false }}
                        /> : <></>}
                    </div>
                </div>
                <div className="w-[290px] px-1 py-1 dark:border-antdDarkBorder border-l relative h-full overflow-auto">
                    {sheetColumns && <ChartCfgForm chart={chart}
                        onChange={setChart}
                        xColumns={x} yColumns={y}
                        sheetColumns={sheetColumns}
                    />}
                </div>
            </div>
        </div>}
    </>
}

export default ChartEditor