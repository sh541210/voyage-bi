interface TokenInfo {
    tokenValue: string // 令牌值
    tokenTimeout: number // 令牌过期时间
}
interface InitisalState {
    user?: LoginUser
    token?: TokenInfo
    shareToken?: string
}
/**
 * 基础值对象（VO），包含创建和更新的时间、用户信息。
 */
interface BaseVO {
    createTime: number // 创建时间
    updateTime: number // 更新时间
    createUser: string | null // 创建用户
    updateUser: string | null // 更新用户
    createBy: string | null // 创建者
    updateBy: string | null // 更新者
}

/**
 * 分页值对象（VO），包含分页数据和分页信息。
 */
interface PageVO<T> {
    data: T[] // 分页数据
    totalCount: number // 总条数
    pageSize: number // 每页大小
    pageNum: number // 当前页码
}

/**
 * 分页请求，包含分页信息和过滤条件。
 */
interface PageRequest<T> {
    pageSize: number // 每页大小
    pageNum: number // 当前页码
    filter: T // 过滤条件
}

/**
 * 登录成功返回的信息，包含用户信息和令牌信息。
 */
interface LoginSuccess {
    user: LoginUser // 登录用户信息
    tokenInfo: TokenInfo
}

/**
 * 登录请求，包含用户名和密码。
 */
interface LoginRequest {
    username: string // 用户名
    password: string // 密码
}

/**
 * 登录用户信息，包含用户的基本信息和角色。
 */
interface LoginUser {
    loginId: number // 登录ID
    username: string // 用户名
    nickname: string // 昵称
    avatarImgUrl: string // 头像URL
    roles: string[] // 用户角色
    gender: number
    tokenInfo: TokenInfo
}

/**
 * 应用值对象（VO），包含应用的基本信息和仪表板信息。
 */
interface AppVO {
    id: number // 应用ID
    name: string // 应用名称
    description: string // 应用描述
    dashboards: DashboardSimpleVO[] // 仪表板列表
    shares: DashboardShareVO[] // 仪表板分享信息
}

/**
 * 仪表板值对象（VO），包含仪表板的详细信息。
 */
interface DashboardVO {
    id: number // 仪表板ID
    name: string // 仪表板名称
    styleCfg: DashboardStyleCfg // 样式配置
    charts: ChartVO[] // 图表列表
    groups: ChartGroupVO[] // 图表组列表
    cfg: DashboardCfg // 仪表板配置
    layoutCfg: LayoutCfg // 布局配置
    type: DashboardType // 仪表板类型
    createTime: number
    updateTime: number
}

/**
 * 仪表板快照值对象（VO），继承自 DashboardVO，包含主题和快照键。
 */
interface DashboardSnapshotVO extends DashboardVO {
    theme: ThemeVO // 主题信息
    key: string // 快照键
}

/**
 * 仪表板类型，可以是仪表板、报表或看板。
 */
type DashboardType = 'DASHBOARD' | 'REPORT' | 'KANBAN'

/**
 * 布局配置，包含不同模式下的布局信息。
 */
type LayoutCfg = Record<Mode, any[]>

/**
 * 模式，可以是手机或PC。
 */
type Mode = 'mobile' | 'pc'

/**
 * 筛选器类型，可以是参数或数据表。
 */
type FilterType = 'parameter' | 'dataSheet'

/**
 * 组件类型，包含日期范围、输入框、选择框等。
 */
type ComponentType = 'dateRange' | 'dateMonthRange' | 'dateMonth' | 'input' | 'select'
    | 'treeSelect' | 'radio' | 'radioButton' | 'date' | 'segmented' | 'cascader'
type ValueType = ComponentType | 'textarea' | 'digit'

/**
 * 选项类型，可以是动态或静态。
 */
type OptionsType = 'dynamic' | 'static'

/**
 * 筛选器配置，包含筛选器的基本信息和配置。
 */
interface FilterCfg {
    key: string // 筛选器键
    componentType: ComponentType // 组件类型
    filterType: FilterType // 筛选器类型
    props: {
        enabled?: boolean // 是否启用
        title?: string // 标题
        showTitle?: boolean // 是否显示标题
        showDateQuick?: boolean // 是否显示日期快捷选项
        showAllOption?: boolean // 是否显示“全部”选项
        dateFormat?: string // 日期格式
        [key: string]: any // 其他属性
    }
    fieldProps: {
        [key: string]: any // 字段属性
    }
    parameterMappings: { [key: number]: { [key: string]: number } } // 参数映射
    optionsProps: {
        optionsType?: OptionsType // 选项类型
        dataSheetId?: number // 数据集ID
        labelColumn?: string // 标签字段
        valueColumn?: string // 值字段
        treeSortColumns?: string[] // 树形排序字段
        staticOptions?: string[] // 静态选项
    }
}

/**
 * 仪表板配置，包含筛选器和图表交互配置。
 */
interface DashboardCfg {
    filters: FilterCfg[] // 筛选器列表
    chartInteractionCfgs: ChartInteractionCfg[] // 图表交互配置
}

/**
 * 图表值对象（VO），包含图表的基本信息和配置。
 */
interface ChartVO {
    id: number // 图表ID
    name: string // 图表名称
    groupId: number | null // 图表组ID
    groupName?: string // 图表组名称
    type: ChartType // 图表类型
    mobileType: ChartType // 移动端图表类型
    styleCfg: ChartStyleCfg // 样式配置
    cfg: ChartCfg // 图表配置
    shareKey?: string // 分享键
    dataSheetId: number // 数据集ID
    dashboardId: number // 仪表板ID
    tipText: string // 提示文本
    columnNotFound: boolean // 列是否未找到
    dataUpdateTime: number // 数据更新时间
    variableNames: string[] // 变量名称
}

/**
 * 条件操作类型，可以是等于或不等于。
 */
type ConditionOperation = 'EQ' | 'NE' | 'IS_NULL' | 'IS_NOT_NULL' | 'EXPR'

/**
 * 条件，包含列信息和操作。
 */
interface Condition extends Column {
    value: any // 条件值
    operation: ConditionOperation // 操作类型
}

/**
 * 参数条件，包含参数值和名称。
 */
interface ParameterCondition {
    // value: any // 参数值
    // name: string // 参数名称
    [name: string]: any
}

/**
 * 地图级别类型，可以是国家、省份、城市或区域。
 */
type MapLevelType = 'country' | 'province' | 'city' | 'area'

/**
 * 图表配置，包含筛选器、条件、参数条件、值、分组等信息。
 */
interface ChartCfg {
    filters: FilterCfg[] // 筛选器列表
    conditions: Condition[] // 条件列表
    parameterConditions: ParameterCondition[] // 参数条件列表
    values: Column[] // 值列表
    groupBy: Column[] // 分组列表
    limit?: number | null // 限制条数
    sortKey?: ColumnKey // 排序键
    props: {
        mapColumnMapping?: Partial<Record<MapLevelType, number | undefined>> // 地图字段映射
    }
}

/**
 * 日期格式，可以是月、周、日或年。
 */
type DateFormat = 'MONTH' | 'WEEK' | 'DAY' | 'YEAR' | 'HOUR' | 'MINUTE'

/**
 * 列键，可以是字符串或数字。
 */
type ColumnKey = string | number

/**
 * 列信息，包含列的基本信息和配置。
 */
interface Column {
    key: ColumnKey // 列键
    id: number // 列ID
    name: string // 列名称
    expression: string // 表达式
    alias: string // 别名
    func?: string // 函数
    sort?: Sort // 排序信息
    sortValues: any[] // 排序值
    customData: string // 自定义数据
    dateFormat?: DateFormat // 日期格式
    dateFormatInterval?: number
    valueProps?: ValueProps // 值属性
    desc: string // 描述
}

/**
 * 列线，继承自 Column，包含数据集列的简单信息。
 */
type ColumnLine = Column & DataSheetColumnSimpleVO



/**
 * 仪表板样式配置，包含图表样式、CSS、看板属性等。
 */
interface DashboardStyleCfg {
    chart?: ChartStyleCfg // 图表样式配置
    css: string // CSS样式
    kanbanProp: KanbanProp // 看板属性
    showUpdateTime: boolean // 是否显示更新时间
    hideChartIds: Record<Mode, number[]> // 隐藏的图表ID
    hideGroupIds: Record<Mode, number[]> // 隐藏的图表组ID
    mobileGroupTypes?: Record<number, GroupType> // 移动端图表组类型
    gridProps: Record<Mode, GridProps> // 网格属性
    groupGridProps: Record<Mode, Record<number, GridProps>> // 图表组网格属性
}

/**
 * 网格属性，包含空间宽度、列数、行高等。
 */
interface GridProps {
    // spaceWidth?: number // 空间宽度
    spaceWidthX?: number // 
    spaceWidthY?: number // 
    cols?: number // 列数
    rowHeight?: number // 行高
}

/**
 * 看板属性，包含看板项和属性配置。
 */
interface KanbanProp {
    items: KanbanItemProps[] // 看板项列表
    props: Record<Mode, {
        tabPosition: 'TOP' | 'BOTTOM' // 标签位置
        type: 'TAB' | 'SEQUENCE' // 类型
    }>
}

/**
 * 看板项属性，包含名称、属性和键。
 */
interface KanbanItemProps {
    name: string // 名称
    props: {
        showUpdateTime: boolean // 是否显示更新时间
    }
    keys: string[] // 键列表
}

/**
 * 值属性，包含百分号、单位、小数位数等。
 */
interface ValueProps {
    percent?: boolean // 是否显示百分号
    unit?: string // 单位
    digit?: number // 小数位数
    numberSplit: boolean // 是否数值分割
}

/**
 * 分页模式，可以是前端或后端。
 */
type PaginationtMode = 'FRONT' | 'BACK'

/**
 * 图表样式配置，包含CSS、标题显示、分页隐藏等。
 */
interface ChartStyleCfg {
    css: string // 图表自定义样式
    showTitle?: boolean // 是否显示标题
    hidePagination?: boolean // 是否隐藏分页
    paginationType?: PaginationtMode // 分页类型
    actions?: string[] // 操作按钮列表
    filterDisplay?: FilterDisplay // 过滤器展示形式
    chartTypes: ChartType[] // 多图表类型
    showIndex?: boolean // 是否显示索引列
    indexName?: string // 索引列名
    pageSize?: number | null // 分页数
    highlights?: Record<string, ColumnKey[]> // 高亮
    sortedKeys?: ColumnKey[] // 支持排序的键
    tableHideKeys?: {
        [key: string]: ColumnKey[] // 表格隐藏列
    }
    renderChartConfig: RenderChartConfig
    autoScroll?: boolean
    hideRefreshTip?: boolean
}

/**
 * 渲染图表配置
 */
interface RenderChartConfig {
    [key: string]: {
        [key: string]: any
    }
}

/**
 * 仪表盘目标类型，可以是值或列。
 */
type GuageTargetType = 'value' | 'column'

/**
 * 数据请求，包含参数。
 */
interface DataRequest {
    parameters: Record<string, any> // 参数
}

/**
 * 图表类型，可以是表格、饼图、折线图等。
 */
type ChartType = 'TABLE' | 'PIE' | 'LINE' | 'COLUMN'
    | 'INDICATOR' | 'AMOUNT_INDICATOR' | 'WORD_CLOUD'
    | 'GUAGE' | 'MAP' | 'LIQUID' | 'FUNNEL' | 'STACKED_COLUMN'

/**
 * 数据集，包含行、列、总数等信息。
 */
interface DataSet {
    rows: any[][] // 行数据
    columns: string[] // 列名
    total?: number // 总数
    x?: string[] // X轴数据
    y?: string[] // Y轴数据
    metadata?: {
        originSql: string
    }
}

/**
 * 数据结果，包含成功状态、消息和数据。
 */
interface DataResult {
    success: boolean // 是否成功
    message?: string // 消息
    data: DataSet // 数据
}

/**
 * 图形渲染类型，可以是 antd、echarts 或 uchart。
 */
type GraphRenderType = 'antd' | 'echarts' | 'uchart'

/**
 * 主题值对象（VO），包含主题的基本信息和样式配置。
 */
interface ThemeVO {
    id: number // 主题ID
    name: string // 主题名称
    dashboardStyleCfg: DashboardStyleCfg // 仪表板样式配置
    renderCode: string // 渲染代码
    graphRenderType: GraphRenderType // 图形渲染类型
}

/**
 * 仪表板简单值对象（VO），包含仪表板的基本信息。
 */
interface DashboardSimpleVO {
    id: number // 仪表板ID
    name: string // 仪表板名称
    description: string // 仪表板描述
    type: DashboardType // 仪表板类型
}

/**
 * 仪表板分享值对象（VO），继承自 DashboardSimpleVO 和 BaseVO，包含分享信息。
 */
interface DashboardShareVO extends DashboardSimpleVO, BaseVO {
    id: number // 分享ID
    name: string // 分享名称
    key: string // 分享键
    dashboardId: number // 仪表板ID
    enabled: boolean // 是否启用
}

/**
 * 工作表类型，可以是视图或表。
 */
type SheetType = 'VIEW' | 'TABLE'

/**
 * 数据表值对象（VO），包含数据表的基本信息和配置。
 */
interface DataSheetVO {
    id: number // 数据表ID
    name: string // 数据表名称
    description: string
    sqlText: string // SQL文本
    sheetType: SheetType // 工作表类型
    datasourceId: number // 数据源ID
    variableNames: string[] // 变量名称
    cfg: DataSheetCfg // 数据表配置
    dataUpdateTime: number // 数据集数据更新时间
}

/**
 * 数据表配置，包含参数默认值。
 */
interface DataSheetCfg {
    parameterDefaultValues: Record<string, any> // 参数默认值
    cacheCfg: CacheCfg
}

/**
 * 缓存配置
 */
interface CacheCfg {
    forceRefresh: boolean //强制刷新
    defaultTTL: number //
    tolerance: number
    minTTL: number // 
    maxTTL: number//
}

/**
 * 数据源值对象（VO），包含数据源的基本信息和配置。
 */
interface DatasourceVO {
    id: number // 数据源ID
    name: string // 数据源名称
    type: string // 数据源类型
    cfgStore: {
        data: Record<string, DatasourceCfg>
        defaultEnv: string
    } // 配置存储
}

/**
 * 数据源配置，包含URL、用户名和密码。
 */
interface DatasourceCfg {
    url: string // URL
    username: string // 用户名
    password: string // 密码
}

/**
 * 列函数，可以是求和或计数。
 */
type ColumnFunc = 'SUM' | 'COUNT'

/**
 * 数据表列简单值对象（VO），包含列的基本信息。
 */
interface DataSheetColumnSimpleVO {
    id: number // 列ID
    name: string // 列名称
    description?: string // 描述
    dataType: SheetColumnDataType // 数据类型
    columnType: SheetColumnType // 列类型
    comment?: string // 注释
    desc?: string // 描述或注释
}

/**
 * 列数据类型枚举，可以是数字、文本或日期。
 */
type SheetColumnDataType = 'NUMBER' | 'TEXT' | 'DATE'

/**
 * 列类型枚举，可以是维度或度量。
 */
type SheetColumnType = 'DIMENSION' | 'METRIC'

/**
 * 数据表详情值对象（VO），继承自 DataSheetVO，包含列信息。
 */
interface DataSheetDetailVO extends DataSheetVO {
    columns: DataSheetColumnVO[] // 列列表
}

/**
 * 数据表表单，包含ID和描述。
 */
interface DataSheetForm {
    id: number // 数据表ID
    description: string // 描述
}

/**
 * 数据表列值对象（VO），包含列的详细信息。
 */
interface DataSheetColumnVO {
    id: number // 列ID
    dataSheetId: number // 数据表ID
    desc: string // 描述
    name: string // 列名称
    description?: string // 描述
    originType?: string // 原类型
    columnLength?: number // 列长度
    originName?: string // 原名称
    comment?: string // 注释
    dataType: SheetColumnDataType // 数据类型
    originDataType?: SheetColumnDataType // 原数据类型
    columnType: SheetColumnType // 列类型
}

/**
 * 排序顺序，可以是升序或降序。
 */
type SortOrderBy = 'ASC' | 'DESC'

/**
 * 排序信息，包含键、名称、顺序等。
 */
interface Sort {
    key: ColumnKey // 排序键
    name?: string // 名称
    orderBy?: SortOrderBy // 排序顺序
    values?: string[] // 排序值
    custom?: boolean // 是否自定义
}

/**
 * 数据模式，可以是缓存或实时。
 */
type DataMode = 'CACHE' | 'REAL_TIME'

/**
 * 下钻参数，包含列ID和过滤器。
 */
interface DrillDownParam {
    columnId?: number // 列ID
    filters: DrillDownFilter[] // 下钻过滤器
}

/**
 * 下钻过滤器，包含列ID和值。
 */
interface DrillDownFilter {
    columnId: number
    values: any[]
}

interface Pagination {
    pageSize: number
    pageNum: number
}

interface ChartDataRequest {
    // 图表ID
    chartId: number
    // 参数
    parameters: Record<string, any>
    // 分享key
    shareKey?: string
    // 环境
    env?: string | null
    // 是否预览
    preview?: boolean
    // 自定义排序
    sorts?: Sort[]
    // 数据模式
    dataMode?: DataMode
    // 下钻参数
    drillDownParam?: DrillDownParam
    // 配置
    chartCfg?: ChartCfg
    // 来源
    source?: string
    // 分页
    pagination?: Pagination
}


interface ChartGroupVO {
    id: number
    title: string
    subTitle: string
    dashboardId: number
    groupType: GroupType
    cfg: ChartGroupCfg
    styleCfg: ChartGroupStyleCfg
    chartIds: number[]
    showTitle: boolean
    customData: string
}
type FilterDisplay = 'inline' | 'block'

interface ChartGroupStyleCfg {
    filterDisplay?: FilterDisplay
    showUpdateTime?: boolean
}

interface ChartGroupCfg {
    filters: FilterCfg[]
    chartTabs?: {
        name: string,
        showTab?: boolean,
        showTitle?: boolean
        chartIds: number[]
        bindId: number
    }[]
}

type GroupType = 'GRID' | 'TAB'

interface Item {
    [key: string]: any
}

interface LabelItem extends Item {
    title?: string
    labels?: string[]
}

interface FileTreeNodeForm {
    id: number
    // 文件树节点名称
    name: string
    // 文件树父节点ID
    pid: number
    bizTypeExtra?: string
    // 文件树业务类型
    bizType: FileTreeNodeBizType
    // 描述
    description: string
}

interface FileTreeNodeVO extends BaseVO {
    // 文件树节点 ID
    id: number
    // 文件树节点名称
    name: string
    // 文件树父节点 ID
    pid: number
    // 文件树业务引用 ID
    bizRefId: number
    // 文件树业务类型
    bizType: FileTreeNodeBizType
    // 业务类型额外信息
    bizTypeExtra: string
    // 描述
    description: string
}

// 文件树节点业务类型枚举
type FileTreeNodeBizType = "dataSheet" | "dashboard" | "datasource" | 'app'

type SourceType = 'default' | 'tableAction' | 'graph' | 'group'
type SourceEvent = 'onClick' | GraphEventName | 'tabChange'
type TargetEvent = 'switchGroupLabel' | 'openChartModal' | 'passParameters' | 'exportChartData'

interface ChartInteractionCfgBase {
    key: string
    name: string
    source: string | null
    target: string | null
    sourceType: SourceType
    sourceEvent: SourceEvent
    targetEvent: TargetEvent
}

/** sourceType 特定字段 */

// `tableAction` 类型 - 需要 `tableId`
interface TableActionSource extends ChartInteractionCfgBase {
    sourceType: 'tableAction';
    actionIndex: number // 按钮位置字段
    paramsMappings: Record<string, string>
}

// `graph` 类型 - 需要 `nodeId`
interface GraphSource extends ChartInteractionCfgBase {
    sourceType: 'graph';
}

// `group` 类型 - 需要 `groupId`
interface GroupSource extends ChartInteractionCfgBase {
    sourceType: 'group';
    changedTab: number
}

/** targetEvent 特定字段 */

// `switchGroupLabel` 目标事件 - 需要 `groupLabel`
interface SwitchGroupLabelTarget extends ChartInteractionCfgBase {
    targetEvent: 'switchGroupLabel';
    tab: number // 标签映射字段
    hideTabs: boolean
}

// `openChartModal` 目标事件 - 需要 `modalId`
interface OpenChartModalTarget extends ChartInteractionCfgBase, ParametersTarget {
    targetEvent: 'openChartModal';
    hideChart: boolean
    paramsMappings: Record<string, string>
}

// `passParameters` 目标事件 - 需要 `params`
interface PassParametersTarget extends ChartInteractionCfgBase, ParametersTarget {
    targetEvent: 'passParameters';
}

// `exportChartData` 目标事件 - 需要 `format`
interface ExportChartDataTarget extends ChartInteractionCfgBase, ParametersTarget {
    targetEvent: 'exportChartData';
    hideChart: boolean

}

interface ParametersTarget {
    paramsMappings: Record<string, string>
}


/** 组合所有可能的类型 */
type ChartInteractionCfg =
    | (TableActionSource & (SwitchGroupLabelTarget | OpenChartModalTarget | PassParametersTarget | ExportChartDataTarget))
    | (GraphSource & (SwitchGroupLabelTarget | OpenChartModalTarget | PassParametersTarget | ExportChartDataTarget))
    | (GroupSource & (SwitchGroupLabelTarget | OpenChartModalTarget | PassParametersTarget | ExportChartDataTarget))
    | (ChartInteractionCfgBase & (SwitchGroupLabelTarget | OpenChartModalTarget | PassParametersTarget | ExportChartDataTarget));

// // 定义 sourceType 为 'tableAction' 时的特定字段
// interface TableActionFields {
//     actionIndex: number // 按钮位置字段
//     paramsMappings: Record<string, string>
// }

// // 定义 targetEvent 为 'switchGroupLabel' 时的特定字段
// interface SwitchGroupLabelFields {
//     tab: number // 标签映射字段
//     hideTabs: true
// }

// interface ExportChartFields extends OpenChartModalFields {
// }

// // targetEvent为'openChartModal'时的特定字段
// interface OpenChartModalFields {
//     hideChart: boolean
//     paramsMappings: Record<string, string>
// }

// interface PassParametersFields {
//     paramsMappings: Record<string, string>
// }

// interface TabChangeFields {
//     changedTab: number
// }

// // 点击切换TAB
// type CIC1 = ChartInteractionCfgBase & {
//     sourceType: 'default'
//     sourceEvent: 'onClick'
//     targetEvent: 'switchGroupLabel'
// } & SwitchGroupLabelFields

// // 表操作点击切换TAB
// type CIC2 = (ChartInteractionCfgBase & {
//     sourceType: 'tableAction'
//     sourceEvent: 'onClick'
//     targetEvent: 'switchGroupLabel'
// } & TableActionFields & SwitchGroupLabelFields)

// // 表操作点击打开MODAL
// type CIC3 = (ChartInteractionCfgBase & {
//     sourceType: 'tableAction'
//     sourceEvent: 'onClick'
//     targetEvent: 'openChartModal'
// } & TableActionFields & OpenChartModalFields)

// // 表操作点击打开MODAL
// type CIC4 = (ChartInteractionCfgBase & {
//     sourceType: 'default'
//     sourceEvent: 'onClick'
//     targetEvent: 'passParameters'
// } & TableActionFields & PassParametersFields)

// type CIC5 = (ChartInteractionCfgBase & {
//     sourceType: 'graph'
//     sourceEvent: 'mapClick'
//     targetEvent: 'passParameters'
// } & PassParametersFields)

// // 表操作点击打开MODAL
// type CIC6 = (ChartInteractionCfgBase & {
//     sourceType: 'tableAction'
//     sourceEvent: 'onClick'
//     targetEvent: 'exportChartData'
// } & TableActionFields & ExportChartFields)

// type CIC7 = (ChartInteractionCfgBase & { sourceType: 'group', sourcEvent: '', targetEvent: '' }
//     & TabChangeFields & SwitchGroupLabelFields)

// // 创建不同组合的配置类型
// type ChartInteractionCfg = CIC1 | CIC2 | CIC3 | CIC4 | CIC5 | CIC6

type GraphEventName = 'mapClick' | 'graphClick'
type ChartComponentType = 'echarts' | 'react'

interface ChartComponentVO {
    id: number
    name: string
    icon: string
    description: string
    code: ChartType
    type: ChartComponentType
    props: ChartComponentProps
}

interface ChartComponentProps {
    limit: ChartColumnLimit[]
    script: string
    confItemsMap: {
        // items集合
        [key: string]: ChartComponentConfItem[]
    }
    // 允许数据为空
    allowEmptyData: boolean
}

interface ChartComponentConfItem {
    key: string | number
    label: string
    fieldName: string
    componentType: ComponentType
    conditionExpression?: string,
    defaultValue?: any
    unit?: string
    columnOptions?: 'y' | 'x' | 'all',
    optionArray?: (string | number)[]
    [key: string]: any
}

interface ChartColumnLimit {
    x: number[] | number,
    y: number[] | number
}

interface HomeCenterDataVO {
    datasourceCount: number
    dataSheetCount: number
    dashboardCount: number
}