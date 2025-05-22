import FormModal from "@/components/base/FormModal";
import SchemaForm from "@/components/base/SchemaForm";
import { requiedRulesInput, requiredRuleSelect } from "@/constants";
import useList from "@/hooks/useList";
import { formatTimestamp } from "@/utils/common/date";
import request from "@/utils/request";
import { PlusOutlined } from "@ant-design/icons";
import { ProFormInstance, ProTable, TableDropdown } from "@ant-design/pro-components";
import { Button, message, Modal } from "antd";
import { cloneElement, JSX, ReactElement, useEffect, useRef, useState } from "react";

interface ShareListDrawerProps {
    trigger?: JSX.Element;
    dashboardId: number
}

const ShareListDrawer = (props: ShareListDrawerProps) => {
    const { dashboardId, trigger } = props
    const [open, setOpen] = useState<boolean>(false)
    const [themes, setThemes] = useState<ThemeVO[]>([])
    const [shares, { set, updateBy }] = useList<DashboardShareVO>([])
    const shareFormRef = useRef<ProFormInstance>(null)
    const fetchShares = (dashboardId: number) => request.GET<DashboardShareVO[]>(`/dashboard/share/list?dashboardId=${dashboardId}`)
        .then(set)
    const fetchThemes = () => request.GET<ThemeVO[]>('/theme/list').then(setThemes)

    useEffect(() => {
        if (open) {
            fetchShares(dashboardId)
            fetchThemes()
        }
    }, [open])
    const triggerWithOnClick = trigger && cloneElement(trigger, {
        onClick: (e: React.MouseEvent) => {
            // 如果原本的 onClick 存在，则调用它
            // @ts-ignore
            if (trigger && (trigger as ReactElement).props.onClick) {
                // @ts-ignore
                (trigger as ReactElement).props.onClick(e);
            }
            // 打开抽屉
            setOpen(true);
        },
    });
    return <>
        {triggerWithOnClick}
        <Modal
            styles={{
                body: { marginTop: -20 },
                // content: { paddingInline: 10 }
            }}
            width={'80%'} title="分享列表"
            onCancel={() => setOpen(false)}
            open={open}
            footer={null}
        >
            <ProTable rowKey='id'
                cardProps={{
                    style: { backgroundColor: 'transparent' },
                    bodyStyle: {
                        paddingInline: 0,
                        paddingBlockStart: 0,
                        backgroundColor: 'transparent'
                    }
                }}
                bordered
                size='small'
                dataSource={shares}
                columns={[
                    { dataIndex: '', title: '序号', width: 48, renderText: (_1, _2, index) => index + 1 },
                    {
                        dataIndex: 'name', title: '名称', renderText: (_, record) => <Button
                            key={`preview_${record.id}`} size='small'
                            type='link' href={`/#/share?key=${record.key}`}
                            target='_blank'>{_}</Button>,
                    },
                    { dataIndex: 'description', title: '描述', },
                    { dataIndex: 'key', title: 'key', width: 180 },
                    { dataIndex: 'createTime', title: '创建时间', width: 160, renderText: (value) => formatTimestamp(value, 'YYYY-MM-dd HH:mm:ss') },
                    { dataIndex: 'updateTime', title: '更新时间', width: 160, renderText: (value) => formatTimestamp(value, 'YYYY-MM-dd HH:mm:ss') },
                    {
                        title: '操作',
                        valueType: 'option',
                        key: 'option',
                        width: 150,
                        fixed: true,
                        render: (text, record, _, action) => [
                            // <Button key={`preview_${record.id}`} size='small' type='link' href={`/#/share?key=${record.key}`} target='_blank'>预览</Button>,
                            <Button key={`update_${record.id}`} size='small' type='link' onClick={() => {
                                request.PUT('/dashboard/share', { ...record }).then(() => message.success('更新成功！'))
                            }}>更新</Button>,
                            <Button key='close' size='small' type='link' onClick={() => {
                                request.PUT(`/dashboard/share/enable?id=${record.id}&enabled=${!record.enabled}`).then(() => {
                                    updateBy(i => i.id === record.id, i => i.enabled = !record.enabled)
                                    message.success(`${!record.enabled ? '开启' : '关闭'}成功！`)
                                })
                            }}>
                                {record.enabled ? '关闭' : '开启'}
                            </Button>,
                            <TableDropdown
                                key={`more_${record.id}`}
                                onSelect={() => action?.reload()}
                                menus={[{
                                    key: 'edit', name: <FormModal
                                        initialValues={record}
                                        onFinish={async (form: any) => {
                                            await request.PUT('/dashboard/share', { ...record, ...form }).then(() => message.success('更新成功！'))
                                            return true
                                        }}
                                        title='编辑'
                                        columns={[{ key: 'name', title: '名称' },
                                        { dataIndex: 'description', title: '描述', }]
                                        } />
                                },
                                { key: 'rollback', name: '回滚' },
                                {
                                    key: 'remove', name: '删除', onClick: () => {
                                        request.DELETE(`/dashboard/share?id=${record.id}`).then(() => {
                                            message.success('删除成功！')
                                            fetchShares(dashboardId)
                                        })
                                    }
                                }]}
                            />,
                        ],
                    },
                ]}
                pagination={false}
                options={false}
                toolBarRender={() =>
                    [<SchemaForm
                        width={400}
                        modalProps={{ destroyOnClose: true }}
                        title='创建新分享'
                        layoutType='ModalForm'
                        columns={[{ dataIndex: 'name', title: '名称', ...requiedRulesInput },
                        { dataIndex: 'description', title: '描述', valueType: 'textarea' },
                        {
                            dataIndex: 'themeId', title: '主题', valueType: 'select',
                            ...requiredRuleSelect,
                            fieldProps: {
                                options: themes.map(i => ({ label: i.name, value: i.id }))
                            }
                        }]}
                        formRef={shareFormRef}
                        onFinish={(formData: any) => {
                            return request.POST('/dashboard/share', {
                                ...formData,
                                dashboardId
                            }).then(() => {
                                message.success('创建成功！')
                                fetchShares(dashboardId)
                                return true
                            }).catch(msg => {
                                return false;
                            })
                        }}
                        trigger={<Button icon={<PlusOutlined />}>创建新分享</Button>}
                    />]
                }
                tableLayout='fixed'
                search={false} />
        </Modal>
    </>
}

export default ShareListDrawer