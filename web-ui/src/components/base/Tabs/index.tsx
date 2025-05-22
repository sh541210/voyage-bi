import { colorPrimary } from "@/constants/theme"
import classNames from "classnames"
import { CSSProperties, forwardRef, JSX, ReactNode, useEffect, useImperativeHandle, useMemo, useState } from "react"

interface TabsProps {
    items: { key: string | number, title?: string | JSX.Element, content: JSX.Element | ReactNode }[]
    hidden?: boolean
    style?: {
        outer?: CSSProperties
        tabs?: CSSProperties
        tab?: CSSProperties
        active?: CSSProperties
    }
    className?: string
    defaultItemKey?: string | number
    onTabChange?: (key: string | number) => void
    tabPosition?: 'BOTTOM' | 'TOP' // 新增属性
}
const Tabs = forwardRef((props: TabsProps, ref) => {
    const { items, hidden = false, tabPosition = 'TOP', style } = props

    const [current, setCurrent] = useState<string | number>(props.defaultItemKey || items[0]?.key)

    useImperativeHandle(ref, () => ({
        changeTab: (key: number | string) => setCurrent(key)
    }))
    useEffect(() => { props.onTabChange?.(current) }, [current])

    const activeStyle: CSSProperties = {
        borderBottom: `2px solid ${colorPrimary}`,
        color: colorPrimary,
        ...style?.active
    }

    const baseStyle: CSSProperties = {
        padding: '2px 4px',
        margin: '0 10px',
        ...style?.tab
    }

    const renderTabs = () => (
        <div className={classNames("flex items-center tabs", props.className)}
            style={{ flex: '0 0 30px', display: hidden ? 'none' : '', ...style?.tabs }}>
            {items.map(i => (
                <div
                    className={classNames('cursor-pointer tab h-full', current === i.key ? 'active' : '')}
                    style={current === i.key ? { ...baseStyle, ...activeStyle } : baseStyle}
                    onClick={() => setCurrent(i.key)}
                    key={`tab-${i.key}`}>
                    {i.title || i.key}
                </div>
            ))}
        </div>
    )

    return (
        <div style={style?.outer} className="w-full relative h-full tabs-container flex flex-col">
            {tabPosition === 'TOP' && renderTabs()}
            <div className="overflow-hidden" style={{ flex: 1 }}>
                {items.find(i => i.key === current)?.content}
            </div>
            {tabPosition === 'BOTTOM' && renderTabs()}
        </div>
    )
})

export default Tabs