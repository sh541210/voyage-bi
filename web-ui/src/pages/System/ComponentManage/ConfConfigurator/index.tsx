import { ItemListForm } from "@/components/base/ItemList"
import { requiedRulesInput, requiredRuleSelect } from "@/constants"
import { COMPONENT_TYPE_LABEL } from "@/constants/ChineseMapping"
import { genKey } from "@/utils/biz"
import request from "@/utils/request"
import { ProFormColumnsType } from "@ant-design/pro-components"
import { Card, message, Button, Popconfirm } from "antd"
import { useCallback, useState } from "react"
import FormModal from "@/components/base/FormModal"
import { renderButton } from "@/utils/render"
import { GroupOutlined } from "@ant-design/icons"

interface ConfConfiguratorProps {
    chartComponent: ChartComponentVO
}

const ChartComopnentConfConfigurator = (props: ConfConfiguratorProps) => {
    const { chartComponent } = props
    const map = chartComponent.props.confItemsMap || {}
    const [confMap, setConfMap] = useState({ ...map })

    const updateConfItemsMap = async (nextMap: Record<string, any>) => {
        await request.PUT('chart/component', {
            ...chartComponent,
            props: {
                ...chartComponent.props,
                confItemsMap: nextMap
            }
        })
        message.success('操作成功!')
        setConfMap(nextMap)
    }

    const getColumns = useCallback((item: ChartComponentConfItem) => {
        return [
            { key: 'fieldName', title: '字段名', ...requiedRulesInput },
            { key: 'label', title: '名称', ...requiedRulesInput },
            {
                key: 'componentType', title: '组件类型',
                valueEnum: COMPONENT_TYPE_LABEL,
                ...requiredRuleSelect,
                fieldProps: { showSearch: true }
            },
            ...(['select', 'segmented'].includes(item.componentType) ? [{
                key: 'optionArray', title: '自定义选项', valueType: 'select',
                fieldProps: { mode: 'tags', placeholder: '回车添加选项', allowClear: true }
            },
            {
                key: 'columnOptions', title: '列选项', valueType: 'segmented',
                valueEnum: { x: '维度', y: '指标', all: '所有列', undefind: '不选' }
            }] : []),
            { key: 'defaultValue', title: '默认值' }
        ] as ProFormColumnsType<ChartComponentConfItem>[]
    }, [chartComponent.props.confItemsMap])

    // onValues
    // FIXME
    return <div style={{ height: 'calc(100vh - 220px)' }}
        className=" overflow-hidden  h-full relative pb-4">
        <div className=" overflow-auto h-full relative p-2">
            {<FormModal
                title={'新增分组'}
                trigger={renderButton(<GroupOutlined key='新增分组' />)}
                columns={[{ key: 'name', title: '分组名称', valueType: 'text' }]}
                onFinish={async (values: { name: string }) => {
                    if (!values.name || confMap[values.name]) {
                        message.error('名称不能为空或已存在')
                        return false
                    }
                    await updateConfItemsMap({ ...confMap, [values.name]: [] })
                    return true
                }}
            />}
            {Object.keys(confMap).map(name => {
                const list = confMap[name]
                return <Card
                    size='small'
                    title={name}
                    extra={
                        <Popconfirm
                            title={`确定删除 ${name} 吗？`}
                            onConfirm={async () => {
                                const nextMap = { ...confMap }
                                delete nextMap[name]
                                await updateConfItemsMap(nextMap)
                            }}
                            okText="是"
                            cancelText="否"
                        >
                            <Button type="link" danger size="small">删除</Button>
                        </Popconfirm>
                    }
                    variant='borderless'
                    key={name}
                >
                    <div className="flex flex-col h-full">
                        <ItemListForm<ChartComponentConfItem>
                            onListChange={async list => {
                                await updateConfItemsMap({ ...confMap, [name]: list })
                            }}
                            list={list}
                            newForm={{ key: genKey(), label: '', fieldName: '', componentType: 'input', props: {} }}
                            columns={getColumns}
                        />
                    </div>
                </Card>
            })}
        </div>
    </div>
}

export default ChartComopnentConfConfigurator