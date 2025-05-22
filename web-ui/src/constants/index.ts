export const DEFAULT_NAME = 'DataVoyage';


export type GridType = 'chart' | 'group'
export const chartFunctions = ['SUM', 'COUNT', 'DISTINCT_COUNT', 'AVG', 'MAX', 'MIN']
// 定义颜色数组
export const COLORS = [
    "#FF5733", // 红色
    // "#33FF57", // 绿色
    "#3357FF", // 蓝色
    // "#FF33A8", // 粉色
    "#FF8C33", // 橙色
    // "#33FFF2", // 青色
    "#B833FF", // 紫色
    "#FFD433", // 黄色
    // "#8CFF33", // 黄绿色
    "#3363FF"  // 深蓝色
];

export const dateFormats: DateFormat[] = ['YEAR', 'MONTH', 'WEEK', 'DAY', 'HOUR', 'MINUTE']

// 组件对应值数量
export const COMPONENT_VALUE_COUNT: Record<ComponentType, number> = {
    dateMonth: 1, dateRange: 2, dateMonthRange: 2,
    input: 1, select: 1, treeSelect: 1, radio: 1,
    radioButton: 1, date: 1, segmented: 1, cascader: 1
}

export const MAX_COLUMN_COUNT = 100

export const getDefaultScript = (code: string, type: ChartComponentType) => {
    switch (type) {
        case 'echarts': return `function main(args) {
            // 数据、元数据、配置
            const { data: { columns, rows, x, y }, chartType, mobile, transpose, key, dark, renderConfig } = args
            // 解构自定义选项
            let { } = renderConfig[chartType.toLowerCase()] || {}
            // echarts选项
            let option = {
        
            }
            return { option }
        }`
        case 'react': return `
    // 可使用 <MyIcon name={'table'}/>、classNames
    const { useEffect, useRef } = React
    const ${code} = ({ args }) => {
        // 数据、元数据、配置
        const { data: { columns, rows, x, y }, chartType, mobile, transpose, key, dark, renderConfig } = args
        // 解构自定义选项
        const { } = renderConfig[chartType.toLowerCase()] || {}
        return <div> 组件「${code}」逻辑</div>
    }
`
    }
}


export const requiedRulesInput = { formItemProps: { rules: [{ required: true, message: '此项为必填' }] } }

export const requiredRuleSelect = { formItemProps: { rules: [{ required: true, message: '此项为必选' }] } }