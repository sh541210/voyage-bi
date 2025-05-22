import { ItemListForm } from "@/components/base/ItemList"
import { requiedRulesInput, requiredRuleSelect } from "@/constants"
import { COMPONENT_TYPE_LABEL } from "@/constants/ChineseMapping"
import { genKey } from "@/utils/biz"
import request from "@/utils/request"
import { ProFormColumnsType } from "@ant-design/pro-components"
import { Card, message } from "antd"
import { useCallback, useMemo } from "react"

interface ConfConfiguratorProps {
    chartComponent: ChartComponentVO
}

const ChartComopnentConfConfigurator = (props: ConfConfiguratorProps) => {
    const { chartComponent } = props
    const map = chartComponent.props.confItemsMap || {}

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
        <div className=" overflow-auto h-full relative">
            {Object.keys(map).map(name => {
                const list = map[name]
                return <Card size='small' title={name} variant='borderless' key={name}>
                    <div className="flex flex-col h-full">
                        <ItemListForm<ChartComponentConfItem>
                            onListChange={list => {
                                request.PUT('chart/component', {
                                    ...chartComponent,
                                    props: {
                                        ...chartComponent.props,
                                        confItemsMap: { [name]: list }
                                    }
                                }).then(() => {
                                    message.success('修改成功!')
                                })
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