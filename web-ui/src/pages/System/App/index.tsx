import SchemaForm from "@/components/base/SchemaForm"
import { useFileNodes } from "@/utils/biz"
import { fixTreeSelect } from "@/utils/common/common"
import request from "@/utils/request"
import { ProTable, ActionType } from "@ant-design/pro-components"
import { Badge, Button, message, Table, Tag } from "antd"
import { useRef } from "react"

const App = () => {
    const { treeSelectData, toRefIds, toNodeIds } = useFileNodes('dashboard')
    const tableRef = useRef<ActionType>(null);
    const getApps = async (params: { pageSize: number; current: number;[key: string]: any }) => {
        const res = await request.POST<PageVO<AppVO>>(`/app/page`, {
            pageSize: params.pageSize,
            pageNum: params.current,
            filter: { ...params },
        });
        return { data: res.data, total: res.totalCount };
    };

    return <div className=" p-4 w-full relative">
        <ProTable
            actionRef={tableRef}
            request={getApps}
            rowKey={'id'}
            expandable={{
                expandedRowRender: (record) => <div className="p-4">
                    {record.dashboards.map(i => <div className="flex mb-4" key={`e-${i.id}`}>
                        <div className=" font-bold">{i.name}</div>
                        <div className="ml-6 flex items-center">
                            {record.shares.filter(j => j.dashboardId == i.id)
                                .map(j => <span className="mr-4">
                                    <Badge text={j.name} color={j.enabled ? 'green' : 'red'} />
                                    <Tag className="ml-2" key={`share_key${j.id}`}>{j.key}</Tag>
                                </span>)}
                        </div>
                    </div>)}
                </div>
            }}
            columns={[
                { title: '序号', dataIndex: 'index', valueType: 'index', width: 60, },
                { dataIndex: 'name', key: 'name', title: '名称', width: 240 },
                { dataIndex: 'description', key: 'description', title: '描述' },
                Table.EXPAND_COLUMN,
                { dataIndex: 'dashboards', key: 'dashboards', title: '分析视图列表', render: (_, record) => record.dashboards.map(i => <Tag key={i.id}>{i.name}</Tag>) },
                {
                    title: '操作',
                    dataIndex: 'operation',
                    key: 'operation',
                    width: 200,
                    render: (_, record) => [
                        <SchemaForm<{ nodeIds: number[] }>
                            key={`form_${record.id}`}
                            labelCol={{ span: 4 }}
                            width={400}
                            modalProps={{ destroyOnClose: true }}
                            title='选择视图列表'
                            layoutType='ModalForm'
                            initialValues={{ nodeIds: toNodeIds(record.dashboards.map(i => i.id)) }}
                            columns={[{
                                dataIndex: 'nodeIds', valueType: 'treeSelect',
                                fieldProps: {
                                    multiple: true,
                                    treeData: fixTreeSelect(treeSelectData),
                                    treeDefaultExpandedKeys: [0],
                                    treeNodeFilterProp: 'title',
                                    showSearch: true,
                                }
                            }]}
                            grid={false}
                            onFinish={async (formData: any) => {
                                request.PUT('/app', { ...record, dashboardIds: toRefIds(formData.nodeIds) }).then(() => {
                                    message.success('修改成功！')
                                    tableRef.current?.reload()
                                })
                                return true
                            }}
                            trigger={<Button type='link' >编辑</Button>} />
                    ]
                },
            ]}
            pagination={{ pageSize: 10 }}
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

export default App