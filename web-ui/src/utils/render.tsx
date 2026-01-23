import { MyIcon } from "@/components/base/MyIcon"
import { DATE_FORMATS_LABEL, FUNCTION_NAME_LABEL } from "@/constants/ChineseMapping"
import { LoadingOutlined } from "@ant-design/icons"
import { useModel } from "@umijs/max"
import { Button, Collapse, Input, InputNumber, Segmented, Select, Switch, theme, Tooltip } from "antd"
import TextArea from "antd/es/input/TextArea"
import classNames from "classnames"
import { CSSProperties, JSX, ReactNode } from "react"

export const useCollapse = (style?: CSSProperties) => {
    const { token } = theme.useToken()
    const { dark } = useModel('global')
    return {
        renderCollapse: (title: string, formItem: ReactNode, collapsed: boolean = false) => {
            return <Collapse
                size='small'
                bordered={false}
                defaultActiveKey={collapsed ? [] : [title]}
                expandIcon={({ isActive }) => <MyIcon className=" fill-gray-500"
                    name={isActive ? 'down' : 'right'} />}
                style={{ background: !dark ? token.colorBgBase : token.colorBgContainer, userSelect: 'none', ...style }}
                items={[{
                    key: title, label: title, children: formItem
                }]}
            />
        }
    }
}

export const renderButton = (i: JSX.Element) => {
    return <Button disabled={i.props.disabled}
        style={{ border: 'none', boxShadow: 'none', backgroundColor: 'transparent' }}
        size='small' key={`button-${i.key}`} icon={i}
        onClick={(e) => {
            i.props?.onClick?.(e)
        }}>{i.key}</Button>
}
export const menuContentRender = (props: any, defaultDom: React.ReactNode): React.ReactNode => {
    const { matchMenuKeys, route } = props;
    // 获取完整路由配置
    const allRoutes: any[] = route?.routes || [];
    // 获取一级菜单路径（matchMenuKeys 的第一个元素）
    const firstMatchedKey = matchMenuKeys?.[0];
    // 从完整路由表里查找一级菜单的 `name`
    const parentMenu = allRoutes.find(item => item.path === firstMatchedKey);

    return (
        <div>
            {/* 在二级菜单顶部插入一级菜单名称 */}
            {parentMenu && (
                <div className="p-4 py-2 text-md bg-transparent
                 dark:border-gray-700 text-antdDarkColorFillQuaternary dark:text-white flex items-center gap-1 ">
                    {parentMenu.icon}
                    {parentMenu.name}
                </div>
            )}
            {/* 渲染默认的二级菜单 */}
            {defaultDom}
        </div>
    );
};


export const renderErrorPrint = (ex: any, className?: string) => {
    return <div className="h-full text-red-600 dark:text-red-500 p-2 text-sm overflow-auto w-full relative">
        <div className="select-none flex flex-col justify-center items-center text-sm font-light bg-antdColorBgLayout dark:bg-antdDarkColorFillQuaternary  h-full w-full">
            <div className={classNames(" whitespace-pre-wrap", className)}>{ex.message}</div>
        </div>
    </div>
}

export const renderAntdComponent = (componentType: ValueType, props: any) => {
    if (componentType === 'select') {
        return <Select {...props} />
    } else if (componentType === 'segmented') {
        return <Segmented {...props} />
    } else if (componentType === 'input') {
        return <Input {...props} onChange={e => props?.onChange(e.target.value)} />
    } else if (componentType === 'textarea') {
        return <TextArea {...props} onChange={e => props?.onChange(e.target.value)} />
    } else if (componentType === 'digit') {
        return <InputNumber {...props} />
    } else if (componentType === 'switch') {
        return <Switch {...props} />
    }
}

export const renderChartComponentType = (type: ChartComponentType) => {
    return <div className="flex gap-2 text-sm items-center"><MyIcon size={24} name={type} />{type} </div>
}

export const renderLoading = (title: JSX.Element | string) => {
    return renderEmpty(<>
        <LoadingOutlined className=' text-4xl font-thin mb-2 text-primaryColor' />
        <div>{title}</div>
    </>)
}

export const renderEmpty = (dom?: JSX.Element | string, className?: string) => {
    return <div className="flex flex-col justify-center text-center
    text-gray-700 p-2 overflow-hidden h-full empty-data">
        <div className={classNames('select-none text-center text-md text-gray-400 w-full whitespace-break-spaces overflow-hidden', className)}>
            {dom}
        </div>
    </div >
}

export const renderActive = (dom: JSX.Element | number | string | undefined) => {
    return <span className='text-primaryColor'>{dom}</span>
}

export const renderToolTipTitle = (name: string | JSX.Element, desc?: string | JSX.Element) => {
    const keyStr = typeof name === 'string' ? name : (name as any)?.key?.toString() || Math.random().toString()
    return <div key={keyStr} className="text-ellipsis whitespace-nowrap overflow-hidden select-none cursor-pointer ">
        {desc ? <Tooltip placement='leftTop' mouseEnterDelay={1}
            title={desc}>{name}
        </Tooltip> : name}
    </div>
}

export const renderSheetColumnTitle = (i: ColumnLine | DataSheetColumnSimpleVO) => {
    return renderToolTipTitle(i.desc || i.name, `${i.name}「${i.desc}」`)
}

export const getHaveExpression = (column: ColumnLine) => {
    return column.expression?.length || 0 > 0
}

export const renderColumnLine = (sortKey: ColumnKey | undefined, column: ColumnLine) => {
    const getExtra = (detail: boolean) => getHaveExpression(column) ?
        `表达式${detail ? `: ${column.expression}` : ''}` :
        (column.func && (detail ? `函数: ${FUNCTION_NAME_LABEL[column.func]}` : FUNCTION_NAME_LABEL[column.func]))

    return <div key={column.key || column.id} className="text-nowrap text-ellipsis overflow-hidden" style={{ maxWidth: '150px' }}>
        {<div className="flex items-center">
            {sortKey === column?.key && column.sort?.orderBy && <MyIcon
                className=" fill-white mr-1" size={15}
                name={column.sort?.orderBy} />}
            {renderToolTipTitle(renderChartNameWithParameters(column.alias || column.desc),
                <div className="flex flex-col gap-2">
                    <div>{column.alias || column.desc} ( {column.name} ) </div>
                    <div>{getExtra(true)}</div>
                </div>
            )}
            {getExtra(false) && <div className="ml-2 flex-shrink-0" style={{ fontSize: '11px' }}>({getExtra(false)})</div>}
            {column.dateFormat && <div className="ml-2 flex-shrink-0" style={{ fontSize: '11px' }}>(
                {column.dateFormatInterval}
                {DATE_FORMATS_LABEL[column.dateFormat]}
                )</div>}
        </div>}
    </div>
}

export const renderChartNameWithParameters = (name: string) => {
    const parts = name?.split(/(\$\{[^}]+\})/g) || []
    return (
        <span className="whitespace-pre-wrap">
            {parts.map((part, idx) =>
                /\$\{([^}]+)\}/.test(part) ? (
                    <span key={idx} className="text-blue-500">
                        {part.replace(/\$\{([^}]+)\}/, '$1')}
                    </span>
                ) : (
                    <span key={idx}>{part}</span>
                )
            )}
        </span>
    )
}