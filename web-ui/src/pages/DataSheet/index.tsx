import DataTable from "@/components/base/DataTable"
import request from "@/utils/request"
import { CloseOutlined, CodeOutlined, LeftSquareOutlined, ReloadOutlined, PlaySquareOutlined } from "@ant-design/icons"
import { message } from "antd"
import { useMemo, useState, useRef } from "react"
import SplitPane from "react-split-pane"
import TreeCommonLayout from "../base/TreeCommonLayout"
import { genKey, useFileNodes } from "@/utils/biz"
import { SheetPreview, SheetSchema, SheetSchemaRef } from "./SheetView"
import { fixTreeSelect, recordToObjectArray } from "@/utils/common/common"
import { EditorContainer } from "@/components/base/Editor"
import FormModal from "@/components/base/FormModal"
import { renderActive, renderButton, renderLoading } from "@/utils/render"
import { SHEET_TYPE_LABEL } from "@/constants/ChineseMapping"
import { requiredRuleSelect } from "@/constants"
import { useSearchParams } from "@umijs/max"
import * as proComponents from "@ant-design/pro-components"
import SchemaForm from "@/components/base/SchemaForm"

type Mode = 'preview' | 'dev'

const DataSheetPage = () => {
    const [params] = useSearchParams()
    const sheetId = params.get('id')
    const defaultMode: Mode = useMemo(() => {
        const m = params.get('mode')
        if (['preview', 'dev'].includes(m as Mode)) {
            return m as Mode
        }
        return 'preview'
    }, [params])

    const [splitSize, setSplitSize] = useState<number>()
    const [sheet, setSheet] = useState<DataSheetVO>()
    const [results, setResults] = useState<{ [sheetId: number]: DataResult & { parameters: any } }>({})
    const { treeSelectData, toRefId, getName } = useFileNodes('datasource')
    const [mode, setMode] = useState<Mode>(defaultMode)
    const [loading, setLoading] = useState<boolean>(false)
    // SheetSchema 的 ref，用于外部触发 fetch
    const schemaRef = useRef<SheetSchemaRef>(null)

    const query = async (datasourceId: number, sqlText: string | undefined, parameters?: any) => {
        if (!sheet) {
            return
        }
        if (sqlText?.length == 0) {
            message.warning('不能为空!')
            return
        }
        setLoading(true)
        !splitSize && setSplitSize(350)
        return request.POST<DataResult>('/dev/query', {
            // env: 'default',
            parameters,
            sqlText,
            datasourceId
        }).then(res => {
            setResults(pre => ({ ...pre, [sheet.id]: ({ ...res, parameters }) }))
            setLoading(false)
            return true
        }).catch(() => setLoading(false))
    }

    const sourceTip = useMemo(() =>
        <div className="flex items-center">来自数据源 {renderActive(getName(sheet?.datasourceId))}</div>, [sheet])

    const handleParameters = (parameters: any) => {
        Object.keys(parameters).forEach(i => {
            const value = parameters[i]
            if (!value || value.trim().length === 0) {
                delete parameters[i]
            }
        })
        return parameters
    }

    const renderDevelop = () => {
        if (!sheet) {
            return
        }
        const result = results[sheet.id]
        const labelCol = { style: { width: `${Math.max(...sheet.variableNames.map(i => i.length)) * 8 + 10}px`, fontWeight: 'bold' } }
        return <div key={sheet.id} className="h-full w-full relative bg-white dark:bg-antdDarkContainer">
            <div className="relative" style={{ height: 'calc(100vh - 154px)' }}>
                {/* @ts-ignore */}
                <SplitPane
                    pane1Style={{
                        minHeight: '0px',
                    }}
                    split='horizontal'
                    size={splitSize}
                    primary="second"
                    minSize={0}
                    maxSize={600}
                    onChange={setSplitSize}
                >
                    <div className="p-2 h-full relative w-full">
                        <EditorContainer
                            className="border dark:border-antdDarkBorder "
                            actions={text => {
                                const key = genKey()
                                return [<FormModal key={`${key}_vars`} width={500}
                                    title='设置默认变量'
                                    labelCol={labelCol}
                                    initialValues={sheet.cfg.parameterDefaultValues}
                                    columns={sheet?.variableNames.map(i => ({
                                        title: i, key: i, fieldProps: { allowClear: true }
                                    } as proComponents.ProFormColumnsType<any>))}
                                    trigger={renderButton(<CodeOutlined key='默认变量'
                                        disabled={sheet?.variableNames.length == 0} />)}
                                    onFinish={(parameters: any) => {
                                        const newSheet: any = {
                                            ...sheet, cfg: {
                                                ...sheet.cfg,
                                                parameterDefaultValues: handleParameters(parameters)
                                            }
                                        }
                                        request.PUT('/data-sheet', { ...newSheet }).then(() => {
                                            setSheet(newSheet)
                                            message.success('保存成功！')
                                        })
                                    }} />,
                                sheet.variableNames.length > 0 ?
                                    <FormModal title='运行变量'
                                        key={`${key}_run`}
                                        labelCol={labelCol}
                                        width={600}
                                        initialValues={result?.parameters || sheet.cfg.parameterDefaultValues}
                                        columns={sheet.variableNames.map(i => ({ key: i, title: i }))}
                                        trigger={renderButton(<PlaySquareOutlined key='执行SQL' />)}
                                        onFinish={(parameters: any) => query(sheet.datasourceId, text, handleParameters(parameters))}
                                    /> : renderButton(<PlaySquareOutlined key={'执行SQL'} onClick={() => query(sheet.datasourceId, text)} />),
                                ]
                            }}
                            origin={sheet.sqlText} language='sql'
                            onOk={text => request.PUT('/data-sheet', { ...sheet, sqlText: text }).then(() => {
                                setSheet({ ...sheet, sqlText: text })
                                message.success('保存成功！')
                            })} />
                    </div>
                    <div className="flex flex-col h-full w-full relative" style={{ zIndex: 1000 }}>
                        <div className="py-1 px-2 flex justify-between basis-[5px]">
                            <div className="font-semibold text-base">查询结果</div>
                            <CloseOutlined className="py-2 px-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-antdDarkColorFillQuaternary" size={20}
                                onClick={() => setSplitSize(0)} />
                        </div>
                        {result?.parameters && Object.keys(result?.parameters).length > 0 && <div className="flex items-center bg-antdColorBgLayout dark:bg-antdDarkColorFillSecondary mx-4" style={{ flex: '0 0 30px' }}>
                            <div className="py-1 ml-4 font-bold">变量</div>
                            <div className=" overflow-x-auto flex gap-1 flex-row flex-nowrap items-center" >
                                {Object.entries(result?.parameters).map(([key, value]: any) =>
                                    <div className="px-2">{key}:{value}</div>
                                )}
                            </div>
                        </div>}
                        <div className=" flex-1 overflow-hidden dark:border-antdDarkBorder px-4 py-2 h-full relative w-full break-all dark:bg-antdDarkContainer">
                            {loading ? renderLoading('查询中请稍后') :
                                result && (result.success ?
                                    <DataTable size='small' pagination={{ pageSize: 10 }}
                                        data={result.data} /> :
                                    <div className=" overflow-auto h-full whitespace-pre-wrap text-red-500 dark:text-red-400">
                                        {result.message}
                                        <div className=" text-orange-500">{result.data.metadata?.originSql}</div>
                                    </div>)}
                        </div>
                    </div>
                </SplitPane>
            </div>
        </div>
    }

    return <TreeCommonLayout<DataSheetVO>
        bizRefId={Number(sheetId)}
        hideLeftTree={false}
        bizType='dataSheet'
        bizName="数据集"
        createMenus={recordToObjectArray(SHEET_TYPE_LABEL, (name, title) => ({
            title, icon: name,
            disabled: name === 'TABLE',
            valueMapper: (values: any) => {
                if (!values.nodeId) {
                    throw new Error('没有选择数据源')
                }
                return ({
                    ...values, bizTypeExtra: name,
                    extraFields: { datasourceId: toRefId(values.nodeId) }
                })
            },
            columns: [{
                dataIndex: 'nodeId', title: '数据源',
                valueType: 'treeSelect',
                ...requiredRuleSelect,
                fieldProps: {
                    showSearch: true,
                    treeDefaultExpandedKeys: [0],
                    treeNodeFilterProp: 'title',
                    treeData: fixTreeSelect(treeSelectData)
                },
            }]
        }))}
        bizFetch={async (id: number) => request.GET<DataSheetVO>(`/data-sheet?id=${id}`)}
        headerExtra={(mode === 'preview' ?
            [<ReloadOutlined key='更新字段'
                onClick={() => sheet && request.PUT(`data-sheet/columns?dataSheetId=${sheet.id}`).then(() => {
                    message.success('更新成功！')
                    schemaRef.current?.fetch()
                })} />,
            <CodeOutlined key={'开发'} onClick={() => setMode('dev')} />]
            : [<LeftSquareOutlined key={'返回预览'} onClick={() => setMode('preview')} />])
            .map(renderButton)}
        tabProps={{ size: 'small', style: { height: 'calc(100vh - 155px)' }, }}
        tabList={(!sheet || mode === 'dev') ? undefined : [{
            key: 'schema', tab: '数据结构',
            children: <SheetSchema ref={schemaRef} dataSheetId={sheet.id} />
        }, {
            key: 'preview', tab: '数据预览',
            children: <SheetPreview sheet={sheet} />
        }, {
            key: 'cacheCfg', tab: '缓存配置',
            children: <div><SchemaForm size='small'
                initialValues={sheet.cfg.cacheCfg}
                submitter={{
                    resetButtonProps: false,
                    searchConfig: { submitText: '保存' }
                }}
                onFinish={form => {
                    request.PUT('/data-sheet', { ...sheet, cfg: { ...sheet.cfg, cacheCfg: form } }).then(() => {
                        message.success('保存成功！')
                    })
                }}
                labelCol={{ style: { width: '80px' } }}
                columns={[{
                    key: 'forceRefresh', title: '强制刷新', valueType: 'switch', fieldProps: {
                        onChange: (value: boolean) => {
                            setSheet({
                                ...sheet, cfg: {
                                    ...sheet.cfg, cacheCfg:
                                        { ...sheet.cfg.cacheCfg, forceRefresh: value }
                                }
                            })
                        }
                    }
                },
                ...(sheet.cfg.cacheCfg.forceRefresh ? [] : [{ key: 'defaultTTL', title: '默认TTL', valueType: 'digit', fieldProps: { addonAfter: '秒' } },
                { key: 'tolerance', title: '容忍窗口', valueType: 'digit', fieldProps: { addonAfter: '秒' } },
                { key: 'minTTL', title: '最小TTL', valueType: 'digit', fieldProps: { addonAfter: '秒' } },
                { key: 'maxTTL', title: '最大TTL', valueType: 'digit', fieldProps: { addonAfter: '秒' } }])
                ]} />
            </div>
        },
        ]}
        // ref={ref}
        renderContent={() => mode === 'dev' && renderDevelop()}
        onFileSelect={setSheet} />
}

export default DataSheetPage