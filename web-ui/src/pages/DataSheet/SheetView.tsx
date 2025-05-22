import request from "@/utils/request"
import { ProTable } from "@ant-design/pro-components"
import { useEffect, useState } from "react"
import DataTable from "@/components/base/DataTable"
import { Button } from "antd"
import FormModal from "@/components/base/FormModal"
import { MyIcon } from "@/components/base/MyIcon"
import { SHEET_COLUMN_DATA_TYPE_LABEL, SHEET_COLUMN_TYPE_LABEL } from "@/constants/ChineseMapping"
import { requiredRuleSelect } from "@/constants"
import { renderActive, renderEmpty, renderLoading } from "@/utils/render"
import { formatDateTime } from "@/utils/common/date"
import { genKey } from "@/utils/biz"

export const SheetSchema = (props: { dataSheetId: number }) => {
    const { dataSheetId } = props
    const [dataSheet, setDataSheet] = useState<DataSheetDetailVO>()

    const fetch = () => request.GET<DataSheetDetailVO>(`/data-sheet/detail?id=${dataSheetId}`).then(data => {
        setDataSheet(data)
    })
    useEffect(() => { fetch() }, [dataSheetId])

    const renderButton = (record: DataSheetColumnVO) => {
        return <FormModal<DataSheetForm>
            key={record.id + genKey()}
            initialValues={record}
            onFinish={formData => request.PUT('/data-sheet/column', { ...record, ...formData }).then(() => {
                fetch()
                return true
            })}
            columns={[{ title: '字段名', dataIndex: 'description' },
            {
                title: '数据类别', dataIndex: 'dataType',
                ...requiredRuleSelect,
                valueType: 'segmented',
                valueEnum: SHEET_COLUMN_DATA_TYPE_LABEL
            }]}
            title={'编辑'} trigger={<Button type='link'>编辑</Button>} />
    }

    return <div className="h-full relative overflow-auto">
        <ProTable<DataSheetColumnVO>
            dataSource={dataSheet?.columns}
            rowKey={'name'}
            columns={[
                { title: '行号', key: 'index', width: 60, renderText: (_1: any, _2: any, index: number) => index + 1 },
                { title: '列名', dataIndex: 'name' },
                {
                    title: '数据类别', dataIndex: 'dataType', width: 100, renderText:
                        (text: SheetColumnDataType) => <div className="flex items-center">
                            <MyIcon className=" fill-primaryColor mr-1" name={text} />{SHEET_COLUMN_DATA_TYPE_LABEL[text]}</div>
                },
                {
                    title: '列类型', dataIndex: 'columnType', width: 100,
                    renderText: (text: SheetColumnType) => SHEET_COLUMN_TYPE_LABEL[text]
                },
                { title: '原数据类型', dataIndex: 'originType', width: 100, },
                { title: '原注释', dataIndex: 'comment' },
                { title: '字段名', dataIndex: 'description' },
                {
                    title: '操作',
                    dataIndex: 'operation',
                    key: 'operation', render: (_, record) => [renderButton(record)]
                }]
            }
            pagination={{ pageSize: 20, }}
            toolBarRender={false}
            tableLayout='fixed'
            cardProps={{
                style: { paddingInline: '0' },
                bodyStyle: { paddingInline: '0px', paddingBlock: '0' }
            }}
            bordered
            search={false}
            size="small" />
    </div>
}

export const SheetPreview = (props: { sheet: DataSheetVO }) => {
    const { sheet: { id, dataUpdateTime } } = props
    const [result, setResult] = useState<DataResult>()
    useEffect(() => {
        setResult(undefined)
        request.POST<DataResult>(`/data-sheet/data/v2`, { id, preview: true })
            .then(result => {
                setResult(result)
            }).catch(message => {
                // @ts-ignore
                setResult({ message, success: false })
            })
    }, [id])

    return result ? <div className="dark:border-antdDarkBorder overflow-auto h-full relative w-full break-all dark:bg-antdDarkContainer">
        {result && (result.success ?
            <div className="h-full relative flex flex-col">
                <div className=" flex justify-between mb-2">
                    <div>
                        显示最新 {renderActive(result.data.rows.length)} 条数据，共 {renderActive(result.data.total)} 条数据
                    </div>
                    {dataUpdateTime && <div>最近数据更新时间：{renderActive(formatDateTime(dataUpdateTime))}</div>}
                </div>
                <div className="flex-1">
                    <DataTable size='small' pagination={{ pageSize: 10 }}
                        data={result.data} />
                </div>
            </div> :
            renderEmpty(result.message, 'text-red-500 dark:text-red-400 text-base')
        )}</div> :
        renderLoading('数据加载中')
}