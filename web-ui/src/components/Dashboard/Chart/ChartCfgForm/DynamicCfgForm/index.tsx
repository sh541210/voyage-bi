import { renderAntdComponent, useCollapse } from "@/utils/render"
import FormItem from "antd/es/form/FormItem"

interface DynamicCfgFormProps {
    renderConfig: RenderChartConfig
    onRenderConfigChange: (renderConfig: RenderChartConfig) => void
    xColumns: Column[]
    yColumns: Column[]
    chartComponent: ChartComponentVO
}
const DynamicCfgForm = (props: DynamicCfgFormProps) => {
    const { renderCollapse } = useCollapse()
    const { renderConfig, chartComponent, xColumns, yColumns, onRenderConfigChange } = props

    const updateRenderChartConfig = <T extends keyof ChartStyleCfg['renderChartConfig']>(
        name: T,
        consumer: (config: NonNullable<ChartStyleCfg['renderChartConfig'][T]>) => void
    ) => {
        let config = renderConfig?.[name] || {}
        consumer(config)
        onRenderConfigChange({ ...renderConfig, [name]: config })
    }

    const renderChartComponentConfigurations = (chartComponent: ChartComponentVO) => {
        const code = chartComponent.code.toLocaleLowerCase()
        const map = chartComponent.props.confItemsMap
        const values = renderConfig[code]
        return map && Object.keys(map).map(cat => {
            const items = map[cat]
            return <div key={cat}>{renderCollapse(cat, <>
                {items.filter(item => {
                    try {
                        return !item.conditionExpression || eval(item.conditionExpression)
                    } catch (err: any) {
                        console.error(`${item.label}条件表达式异常`, item.conditionExpression, err)
                        return false
                    }
                }).map((item, idx) => {
                    let options = item.options
                    const array = item?.optionArray
                    const columnOptions = item?.columnOptions
                    if (array) {
                        options = array.map((i: any) => ({ value: i, label: i }))
                    } else if (columnOptions) {
                        options = columnOptions === 'all' ? [...xColumns, ...yColumns] :
                            (columnOptions === 'x' ? [...xColumns] : [...yColumns]).map((i, idx) =>
                                ({ value: idx, label: i.alias || i.desc }))
                    }
                    return <FormItem label={item.label} key={`${item.key}-${idx}`}>
                        {renderAntdComponent(item.componentType, {
                            ...item,
                            value: values?.[item.fieldName],
                            onChange: (value: any) => updateRenderChartConfig(code, i => {
                                i[item.fieldName] = value
                            }),
                            options
                        })}
                    </FormItem>
                })}
            </>)}</div>
        })
    }
    return renderChartComponentConfigurations(chartComponent)
}

export default DynamicCfgForm