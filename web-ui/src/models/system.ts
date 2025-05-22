import { HighlightProps } from "@/components/base/DataTable"
import request from "@/utils/request"
import { useModel } from "@umijs/max"
import { useCallback, useEffect, useState } from "react"

interface SystemConfig {
    iconFontJsUrl: string,
    homeDashboardKey?: string,
    tableHighlights: ({
        name: string
        label?: string
        dataTypes?: SheetColumnDataType[]
    } & Pick<HighlightProps, 'className' | 'logical'>)[]
}

const DEFAULT_COMPONENTS: ChartComponentVO[] = [{
    name: '表格', type: 'react', description: '', code: 'TABLE', id: -3, icon: 'table',
    props: { allowEmptyData: false, confItemsMap: {}, script: '', limit: [{ x: [0, 100], y: [0, 100] }] }
}]

const useConfig = () => {
    const { initialState } = useModel('@@initialState')
    const [systemConfig, setSystemConfig] = useState<SystemConfig>({
        iconFontJsUrl: '',
        tableHighlights: [
            {
                name: 'minColumns', className: 'min', label: '最小值', dataTypes: ['NUMBER'],
                logical: `function main(args) {const toNumber = str => Number(str.replaceAll(',', '')); const {values, value} = args; return toNumber(value) === Math.min(...values.map(i=>toNumber(i)));}`
            },
            {
                name: 'maxColumns', className: 'max', label: '最大值', dataTypes: ['NUMBER'],
                logical: `function main(args) {const toNumber = str => Number(str.replaceAll(',', '')); const {values, value} = args; return toNumber(value) === Math.max(...values.map(i=>toNumber(i)));}`
            },
            {
                name: 'expiredDate', label: '过期日期', dataTypes: ['DATE'],
                logical: `function main(args) {const {value} = args; return new Date(value) < new Date();}`
            }
        ]
    })
    const [chartComponents, setChartComopnents] = useState<ChartComponentVO[]>(DEFAULT_COMPONENTS)

    useEffect(() => {
        if (!initialState) {
            return
        }
        request.GET('/system/config/values').then(data => setSystemConfig(pre => ({ ...pre, ...data })))
        request.GET('/chart/component/list')
            .then(list => setChartComopnents(origin => [...origin, ...list]))
    }, [initialState])

    return {
        systemConfig, chartComponents,
        getChartComponent: useCallback((code: string) => chartComponents.find(i => i.code === code), [chartComponents])
    }
}

export default useConfig