import ChartTypeSelector from "../ChartTypeSelector"
import { Button, Form, Input, InputNumber, Segmented, Select, Space, Switch, Tabs } from "antd"
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons"
import { useEffect, useMemo } from "react"
import TextArea from "antd/es/input/TextArea"
import FormItem from "antd/es/form/FormItem"
import { mapLevelTypes } from "../ChartView/echarts/MapView"
import { useCollapse } from "@/utils/render"
import { MAP_LEVEL_TYPE_LABEL } from "@/constants/ChineseMapping"
import { MyIcon } from "@/components/base/MyIcon"
import { useModel } from "@umijs/max"
import DynamicCfgForm from "./DynamicCfgForm"

interface ChartCfgFormProps {
    chart: ChartVO
    onChange: (chart: ChartVO) => void
    xColumns: ColumnLine[]
    yColumns: ColumnLine[]
    sheetColumns: DataSheetColumnSimpleVO[]
}

const ChartCfgForm = (props: ChartCfgFormProps) => {
    const { chart, onChange: setChart, xColumns: x, yColumns: y } = props
    const { renderCollapse } = useCollapse()
    const { getChartComponent } = useModel('system')
    const chartComponent = useMemo(() => getChartComponent(chart.type), [chart.type])

    useEffect(() => {
        updateChartStyleCfg(i => i.showTitle = i.showTitle ?? true)
    }, [])

    useEffect(() => {
        if (chart.type === 'TABLE') {
            updateChartStyleCfg(i => {
                i.showIndex = i.showIndex ?? false
                i.hidePagination = i.hidePagination ?? true
            })
            updateChartCfg(i => i.limit = i.limit ?? 1000)
        }
    }, [chart.type])

    useEffect(() => {
        if (!chart.styleCfg.hidePagination) {
            updateChartStyleCfg(i => i.pageSize = i.pageSize ?? 10)
        }
    }, [chart.styleCfg.hidePagination])

    const updateChartCfg = (consumer: (chartCfg: ChartCfg) => void) => {
        if (chart) {
            const t = { ...chart }
            chart && consumer(t.cfg)
            setChart(t)
        }
    }

    const updateChartStyleCfg = (consumer: (chartStyleCfg: ChartStyleCfg) => void) => {
        if (chart) {
            const t = { ...chart }
            let config = t.styleCfg || {}
            consumer(config)
            t.styleCfg = config
            setChart(t)
        }
    }

    // const updateRenderChartConfig = <T extends keyof ChartStyleCfg['renderChartConfig']>(
    //     name: T,
    //     consumer: (config: NonNullable<ChartStyleCfg['renderChartConfig'][T]>) => void
    // ) => {
    //     if (chart) {
    //         const t = { ...chart }
    //         let config = t.styleCfg?.renderChartConfig?.[name] || {}
    //         consumer(config)
    //         setChart({
    //             ...t, styleCfg: {
    //                 ...t.styleCfg,
    //                 renderChartConfig: { ...t.styleCfg.renderChartConfig, [name]: config }
    //             }
    //         })
    //     }
    // }

    return <>
        <Form variant='filled' size='small'>
            {renderCollapse('图表标题', <Space.Compact style={{ width: '100%' }}>
                <Input value={chart.name}
                    onChange={e => setChart({ ...chart, name: e.target.value })} />
                <Button type="primary"
                    icon={chart.styleCfg?.showTitle ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    onClick={() => updateChartStyleCfg(i => i.showTitle = !i.showTitle)}
                ></Button>
            </Space.Compact>)}
            {renderCollapse('图表类型', <><Tabs tabBarStyle={{ marginBottom: '12px' }} tabBarGutter={15}
                size='small' items={[{ label: 'pc', key: 'type' }, { label: 'mobile', key: 'mobileType' }]
                    .map(i => ({
                        ...i, label: <div className="px-2">
                            <MyIcon name={i.label} />
                        </div>, children: <ChartTypeSelector
                            checkType={true}
                            xColumns={x}
                            yColumns={y}
                            value={[(chart as any)[i.key] as ChartType]}
                            onChange={type => { setChart({ ...chart, [i.key]: type[0] }) }} />
                    }))} />

            </>)}
            {renderCollapse('多类型切换', <ChartTypeSelector
                xColumns={x}
                yColumns={y}
                value={chart.styleCfg.chartTypes} onChange={types => {
                    updateChartStyleCfg(i => i.chartTypes = types)
                }} />, true)}
            {['TABLE', 'COLUMN', 'LINE'].includes(chart.type) && renderCollapse('数据相关', <>
                <FormItem label='数据量限制'>
                    <InputNumber<number> min={0}
                        value={chart.cfg.limit}
                        onChange={(value: number | null) => updateChartCfg(i => i.limit = value)} />
                </FormItem></>)}
            {chart.type === 'TABLE' && renderCollapse('表格配置', <>
                <FormItem label='分页'>
                    <Switch defaultValue={true} value={!chart.styleCfg?.hidePagination}
                        onChange={value => { updateChartStyleCfg(i => i.hidePagination = !value) }} />
                </FormItem>
                {!chart.styleCfg?.hidePagination && <FormItem label='分页类型'>
                    <Segmented size='small' value={chart.styleCfg?.paginationType}
                        onChange={value => updateChartStyleCfg(i => i.paginationType = value as PaginationtMode)}
                        options={[{ value: 'BACK', label: '前端' }, { value: 'FRONT', label: '后端' }]} />
                </FormItem>}
                {<FormItem label={!chart.styleCfg.hidePagination ? '分页数' : '显示数'}>
                    <InputNumber<number> min={1} value={chart.styleCfg.pageSize}
                        onChange={(value: number | null) => updateChartStyleCfg(i => i.pageSize = value)} />
                </FormItem>}
                <FormItem label='显示索引列'>
                    <Switch defaultValue={false} value={chart.styleCfg?.showIndex}
                        onChange={value => { updateChartStyleCfg(i => i.showIndex = value) }} />
                </FormItem>
                {chart.styleCfg.showIndex && <FormItem label='索引列名称'>
                    <Input value={chart.styleCfg.indexName}
                        onChange={e => updateChartStyleCfg(i => i.indexName = e.target.value)} />
                </FormItem>}
                <FormItem label='自定义操作'>
                    <Select placeholder='输入后回车' mode='tags' value={chart.styleCfg.actions}
                        onChange={value => updateChartStyleCfg(i => i.actions = value)} />
                </FormItem>
                {chart.styleCfg?.hidePagination && <FormItem label='无限滚动'>
                    <Switch defaultValue={false} value={chart.styleCfg?.autoScroll}
                        onChange={value => { updateChartStyleCfg(i => i.autoScroll = value) }} />
                </FormItem>}
                {chart.styleCfg?.hidePagination && <FormItem label='滚动间隔(ms)'>
                    <InputNumber defaultValue={100} value={chart.styleCfg?.scrollInterval}
                        onChange={(value: number | null) => { updateChartStyleCfg(i => i.scrollInterval = value) }} />
                </FormItem>}
            </>)}
            {chart.type === 'MAP' && renderCollapse('省市区配置', <>
                {mapLevelTypes.filter(i => i !== 'country')
                    .map(type => <FormItem key={type} label={MAP_LEVEL_TYPE_LABEL[type]}>
                        <Select allowClear value={chart.cfg.props.mapColumnMapping?.[type]} onChange={value => {
                            updateChartCfg(i => {
                                let map = i.props?.mapColumnMapping
                                i.props.mapColumnMapping = { ...map, [type]: value }
                            })
                        }} options={props.sheetColumns.map(i => ({ value: i.id, label: i.desc || i.name }))} />
                    </FormItem>)}
            </>)}
            {renderCollapse('其他', <>
                <FormItem label='隐藏刷新加载提示'>
                    <Switch defaultValue={false} value={chart.styleCfg?.hideRefreshTip}
                        onChange={value => { updateChartStyleCfg(i => i.hideRefreshTip = value) }} />
                </FormItem>
            </>)}
            {chartComponent && <DynamicCfgForm
                xColumns={props.xColumns}
                yColumns={props.yColumns}
                chartComponent={chartComponent}
                renderConfig={chart.styleCfg.renderChartConfig || {}}
                onRenderConfigChange={config => {
                    if (chart) setChart({ ...chart, styleCfg: { ...chart.styleCfg, renderChartConfig: { ...chart.styleCfg.renderChartConfig, ...config } } })
                }}
            />}
            {renderCollapse('图表注释', <TextArea
                placeholder='输入图表注释'
                rows={6}
                value={chart.tipText}
                onChange={e => setChart({ ...chart, tipText: e.target.value })} />)}
        </Form>
    </>
}

export default ChartCfgForm