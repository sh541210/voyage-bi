import { EditorContainer } from "@/components/base/Editor"
import useList from "@/hooks/useList"
import request from "@/utils/request"
import { message, Tabs } from "antd"
import { useEffect, useState } from "react"

const defaultRenderCode = `const { data, chartType, x, y, mobile } = renderSchema
// chartType: type ChartType = 'TABLE' | 'PIE' | 'LINE' | 'COLUMN' | 'INDICATOR' | 'AMOUNT_INDICATOR' | 'WORD_CLOUD' | 'GUAGE' | 'MAP' | 'LIQUID'
// data: type DataSet = Array<Record<string, any>>
// x: string[]
// y: string[]
// mobile: boolean
return {}
`

const ThemeMngPage = () => {
    const [graphRenderType, setGraphRenderType] = useState<GraphRenderType>()
    const [splitSize, setSplitSize] = useState<number>(800)
    const [dataResult, setDataResult] = useState<DataResult>()
    const [themeList, { set, updateAt }] = useList<ThemeVO>([])

    const fetchThems = () => request.GET<ThemeVO[]>('/theme/list')
        .then(set)

    useEffect(() => {
        fetchThems()
    }, [])

    const updateTheme = (index: number, theme: ThemeVO) => {
        request.PUT('/theme', { ...theme }).then(() => {
            updateAt(index, theme)
            message.success('保存成功!')
        })
    }

    const renderContent = (idx: number, theme: ThemeVO) => {
        return <Tabs
            key={theme.id}
            size='small'
            defaultActiveKey="less"
            className="w-full bg-antdDarkColorFill dark:bg-antdDarkColorFillQuaternary"
            style={{ height: 'calc(100vh - 0px)' }}
            tabPosition='right'
            renderTabBar={(props, DefaultTabBar) => <DefaultTabBar {...props} >
                {(node) => (<div style={{
                    writingMode: "vertical-lr",
                    textOrientation: "upright",
                    letterSpacing: '3px',
                    textAlign: "center",
                    margin: '10px -15px'
                }}>{node}</div>)}
            </DefaultTabBar>}
            items={[{
                label: '仪表板样式', key: 'less',
                style: { padding: 0 },
                children: <EditorContainer origin={theme.dashboardStyleCfg.css} language='less'
                    onOk={text => updateTheme(idx, { ...theme, dashboardStyleCfg: { ...theme.dashboardStyleCfg, css: text } })} />
            },
            {
                label: '图配置项', key: 'typescript',
                style: { padding: 0 },
                children: <EditorContainer origin={theme.renderCode} language='typescript'
                    onOk={text => updateTheme(idx, { ...theme, renderCode: text })} />
            }]} />
    }

    return <div className="bg-white dark:bg-antdDarkContainer">
        <Tabs type="editable-card" tabBarStyle={{ marginBottom: 0 }}
            items={themeList.map((i, index) => ({
                key: i.id.toString(),
                label: i.name, children: renderContent(index, i)
            }))} />
    </div>
}

export default ThemeMngPage