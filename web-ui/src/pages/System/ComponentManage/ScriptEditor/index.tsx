import { EditorContainer } from "@/components/base/Editor"
import ChartView from "@/components/Dashboard/Chart/ChartView"
import { CHART_COMPONENT_TYPE_LABEL } from "@/constants/ChineseMapping"
import { generateMockData } from "@/utils/biz"
import { renderButton, renderChartComponentType } from "@/utils/render"
import request from "@/utils/request"
import { EyeOutlined, LeftOutlined, PlayCircleOutlined } from "@ant-design/icons"
import { PageContainer } from "@ant-design/pro-components"
import { history, useSearchParams } from "@umijs/max"
import { message, Select } from "antd"
import { useEffect, useState } from "react"
import ChartComopnentConfConfigurator from "../ConfConfigurator"
import { useDynamicIcon } from "@/components/DynamicIcon"
import SplitPane from "react-split-pane"
import DynamicCfgForm from "@/components/Dashboard/Chart/ChartCfgForm/DynamicCfgForm"


const ChartComponentScriptEditor = () => {
    const [params] = useSearchParams()
    const { iconOptions } = useDynamicIcon()
    useEffect(() => {
        const id = params.get('id')
        if (!id) {
            back()
            return
        }
        request.GET(`/chart/component?id=${id}`).then(setChartComponent)
    }, [])
    const back = () => history.push('/system/chartComponents/manage')
    const [chartComponent, setChartComponent] = useState<ChartComponentVO>()
    const [previewWindow, setPreviewWindow] = useState<boolean>(true)
    const [previewScript, setPreviewScript] = useState<string>('')
    const [leftSplitSize, setLeftSplitSize] = useState<number>(500)
    const [downSplitSize, setDownSplitSize] = useState<number>(500)
    const [renderChartConfig, setRenderChartConfig] = useState<RenderChartConfig>({})

    useEffect(() => {
        chartComponent && setPreviewScript(chartComponent.props.script)
    }, [chartComponent])

    const updateComponent = (component: ChartComponentVO) => {
        request.PUT('/chart/component', component).then(() => {
            setChartComponent(component)
            message.success('保存成功!')
        })
    }

    const renderConfigurator = (chartComponent: ChartComponentVO) => {
        const mockData = generateMockData(chartComponent)
        return <PageContainer
            className="bg-white h-full dark:bg-black"
            onBack={back}
            subTitle={chartComponent.description}
            header={{ style: { padding: '0 20px', height: '100%', display: 'flex', flexDirection: 'column' } }}
            backIcon={renderButton(<LeftOutlined key='返回' />)}
            tabProps={{
                defaultActiveKey: '基础设置',
                style: { display: 'flex', flexDirection: 'column', height: '100%' },
                tabBarGutter: 20,
            }}
            tabList={[{
                key: '基础设置', children:
                    <div className="py-2 flex flex-col gap-6">
                        <div className="flex items-center">
                            名称: {chartComponent.name}
                        </div>
                        <div className="flex items-center">
                            描述：{chartComponent.description || '-'}
                        </div>
                        <div className="flex items-center">
                            类型： {renderChartComponentType(chartComponent.type)}
                        </div>
                        <div className="flex items-center">
                            图标：
                            <Select className="w-[200px]" showSearch value={chartComponent.icon} options={iconOptions} />
                        </div>
                        <div className="flex items-center">
                            允许空数据：{chartComponent.props.allowEmptyData ? '是' : '否'}
                        </div>
                        <div className="flex items-center">
                            限制规则：
                            <div className="flex items-center gap-4">
                                {chartComponent.props.limit.map((i, idx) => <div className="flex px-4 py-1 bg-antdColorBgLayout dark:bg-antdDarkContainer cursor-pointer hover:bg-gray-200 dark:hover:bg-antdDarkColorFillSecondary select-none "
                                    key={`${chartComponent.id}_${idx}`}>
                                    维度: {i.x}
                                    指标: {i.y}
                                </div>)}</div>
                        </div>
                    </div>
            }, {
                key: CHART_COMPONENT_TYPE_LABEL[chartComponent.type],
                children: <div className="h-full relative pb-4">
                    <div className="h-full relative border dark:border-antdDarkContainer">
                        {/* @ts-ignored */}
                        <SplitPane
                            pane1Style={{
                                minWidth: '0px'
                                // maxWidth: 'calc(100% - 1px)'
                            }}
                            split="vertical"
                            size={previewWindow ? leftSplitSize : 0}
                            primary='second'
                            minSize={300}
                            maxSize={800}
                            onChange={setLeftSplitSize}
                        >
                            <EditorContainer
                                origin={chartComponent.props.script}
                                language='typescript'
                                actions={text => [
                                    <EyeOutlined key={!previewWindow ? '预览' : '关闭预览'} onClick={() => {
                                        setPreviewWindow(pre => !pre)
                                    }} />, <PlayCircleOutlined key='更新预览' onClick={() => {
                                        setPreviewScript(text || '')
                                    }} />].map(renderButton)}
                                onOk={text => updateComponent(({ ...chartComponent, props: { ...chartComponent.props, script: text } }))} />
                            {<div className="h-full w-full bg-white dark:bg-antdDarkContainer overflow-auto">
                                {/* @ts-ignored */}
                                <SplitPane
                                    pane1Style={{
                                        minHeight: '0px',
                                    }}
                                    split='horizontal'
                                    size={downSplitSize}
                                    primary="second"
                                    minSize={0}
                                    maxSize={880}
                                    onChange={setDownSplitSize}
                                >
                                    <ChartView
                                        chartType={chartComponent.code}
                                        onDataUpdate={async () => ({ success: true, data: mockData.data })}
                                        // @ts-ignore
                                        yColumns={mockData.yColumns}
                                        xColumns={mockData.xColumns}
                                        chartId={0}
                                        dataRequest={{ chartId: 0, parameters: {} }}
                                        graphRenderType="echarts"
                                        chartStyleCfg={{
                                            css: '',
                                            chartTypes: [],
                                            renderChartConfig
                                        }}
                                        chartComponent={{
                                            ...chartComponent,
                                            props: {
                                                ...chartComponent.props,
                                                script: previewScript
                                            }
                                        }} />
                                    <div className="bg-white dark:bg-black h-full w-full">
                                        <DynamicCfgForm
                                            renderConfig={renderChartConfig}
                                            onRenderConfigChange={setRenderChartConfig}
                                            chartComponent={chartComponent}
                                            xColumns={mockData.xColumns}
                                            yColumns={mockData.yColumns} />
                                    </div>
                                </SplitPane>
                            </div>}
                        </SplitPane>

                    </div>
                </div>
            }, {
                key: '自定义配置项', children: <ChartComopnentConfConfigurator chartComponent={chartComponent} />
            }].map(i => ({ ...i, label: i.key }))} />
    }
    return chartComponent && renderConfigurator(chartComponent)
}

export default ChartComponentScriptEditor