import { GridType } from "."

export const CHART_INTERACTION_LABEL: Record<SourceEvent | SourceType | TargetEvent, string> = {
    exportChartData: '导出图表数据',
    graph: '图',
    onClick: '点击',
    default: '默认',
    tableAction: '表格操作',
    switchGroupLabel: '切换组标签',
    openChartModal: '打开图表对话框',
    passParameters: '传递参数',
    mapClick: '地图点击',
    graphClick: '图点击',
    group: '组',
    tabChange: '标签切换'
}

// export const CHART_TYPE_LABEL: Record<ChartType, string> = {
//     COLUMN: '柱状图',
//     PIE: '饼图',
//     LINE: '折线图',
//     INDICATOR: '指标卡',
//     AMOUNT_INDICATOR: '金额指标卡',
//     LIQUID: '水波图',
//     WORD_CLOUD: '词云',
//     GUAGE: '计量图',
//     TABLE: '表格',
//     MAP: '地图',
//     FUNNEL: '漏斗图',
//     STACKED_COLUMN: '堆叠柱形图'
// }
export const DATE_FORMATS_LABEL: Record<DateFormat, string> = {
    YEAR: '年',
    MONTH: '月',
    WEEK: '周',
    DAY: '日',
    HOUR: '小时',
    MINUTE: '分钟'
}

export const COMPONENT_TYPE_LABEL: Record<ComponentType | 'textarea', string> = {
    date: '日期',
    dateMonth: '月份', dateRange: '日期范围',
    dateMonthRange: '月份范围', input: '输入框',
    select: '选择器', treeSelect: '树选择器',
    radio: '单选框',
    radioButton: '单选框「按钮」',
    segmented: '分段控制器',
    cascader: '级联选择器',
    textarea: '文本输入框',
    switch: "开关"
}

export const VALUE_TYPE_LABEL: Record<ValueType, string> = {
    ...COMPONENT_TYPE_LABEL,
    textarea: '文本',
    digit: '数字'
}

export const GRID_TYPE_LABEL: Record<GridType, String> = {
    chart: '图表',
    group: '图表组'
}
export const FILTER_TYPE_LABEL: Record<FilterType, string> =
    { parameter: '变量参数', dataSheet: '数据集列' }
export const FUNCTION_NAME_LABEL: Record<string, string> = {
    SUM: '求和', COUNT: '计数', DISTINCT_COUNT: '去重计数',
    AVG: '平均值', 'MAX': '最大值', 'MIN': '最小值'
}

export const SHEET_TYPE_LABEL: Record<SheetType, string> = {
    VIEW: 'SQL数据集',
    TABLE: '数据表'
}

export const SHEET_COLUMN_DATA_TYPE_LABEL: Record<SheetColumnDataType, string> =
    { 'TEXT': '文本', 'DATE': '日期', 'NUMBER': '数字' }

export const SHEET_COLUMN_TYPE_LABEL: Record<SheetColumnType, string> =
    { 'DIMENSION': '维度', 'METRIC': '指标' }

export const MAP_LEVEL_TYPE_LABEL: Record<MapLevelType, string> = {
    'area': '区县',
    'city': '市',
    'province': '省',
    'country': '国家'
}

export const DASHBOARD_TYPE_LABEL: Record<DashboardType, string> = {
    'DASHBOARD': '仪表板',
    'REPORT': '报表',
    'KANBAN': '组合看板'
}

export const CHART_COMPONENT_TYPE_LABEL: Record<ChartComponentType, string> =
    { echarts: 'echarts配置', react: 'React JSX代码' }

export const CONDITION_OPERATION_LABEL: Record<ConditionOperation, string> =
    { EQ: '等于', NE: '不等于', IS_NOT_NULL: '不等于NULL', IS_NULL: '等于NULL', EXPR: '表达式' }

export default {
    CHART_INTERACTION_LABEL,
    // CHART_TYPE_LABEL,
    DATE_FORMATS_LABEL,
    COMPONENT_TYPE_LABEL,
    GRID_TYPE_LABEL,
    FILTER_TYPE_LABEL,
    FUNCTION_NAME_LABEL,
    SHEET_TYPE_LABEL,
    SHEET_COLUMN_DATA_TYPE_LABEL,
    SHEET_COLUMN_TYPE_LABEL,
    MAP_LEVEL_TYPE_LABEL,
    DASHBOARD_TYPE_LABEL,
    CHART_COMPONENT_TYPE_LABEL,
    CONDITION_OPERATION_LABEL
}