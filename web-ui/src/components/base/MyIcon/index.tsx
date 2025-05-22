import { Icon } from "@umijs/max"
import { Dropdown } from "antd"
import classNames from "classnames"
import { CSSProperties, JSX } from "react"

interface MyIconsProps {
    icons: IconProps[],
    size?: number,
    moreSize?: number
    visible?: boolean
    itemClassName?: string
    moreList?: string[]
    bgHover?: boolean
}

export interface IconProps {
    name: string,
    title?: string | ((icon: JSX.Element) => JSX.Element)
    visible?: boolean,
    onClick?: () => void,
    color?: boolean
    size?: number,
    className?: string
    style?: CSSProperties
    disabled?: boolean
    bgHover?: boolean
}
const defaultColor: Record<string, { fill: string, text: string, hoverFill: string, hoverText: string }> = {
    'table': { fill: 'fill-blue-500', text: 'text-blue-500', hoverFill: 'hover:fill-blue-500', hoverText: 'hover:text-blue-500' },
    'edit': { fill: 'fill-orange-400', text: 'text-orange-400', hoverFill: 'hover:fill-orange-400', hoverText: 'hover:text-orange-400' },
    'copy': { fill: 'fill-green-400', text: 'text-green-400', hoverFill: 'hover:fill-green-400', hoverText: 'hover:text-green-400' },
    'filter': { fill: 'fill-teal-600', text: 'text-teal-600', hoverFill: 'hover:fill-teal-600', hoverText: 'hover:text-teal-600' },
    'delete': { fill: 'fill-red-500', text: 'text-red-500', hoverFill: 'hover:fill-red-500', hoverText: 'hover:text-red-500' },
    'down-xls': { fill: 'fill-sky-500', text: 'text-sky-500', hoverFill: 'hover:fill-sky-500', hoverText: 'hover:text-sky-500' }
};

export const MyIcons = (props: MyIconsProps) => {
    const { size, moreSize, icons, visible = true, moreList = [] } = props
    const list = icons.filter(i => !moreList.includes(i.name))
    const moreIcons = moreList.map(name => icons.find(k => k.name === name) as IconProps)
        .filter(i => i.visible !== undefined ? i.visible : visible)
        .map(i => ({ ...i, size: i.size || moreSize }))
    if (moreIcons.length > 0) {
        list.push({ name: 'more' })
    }

    const renderIcon = (i: IconProps) => {
        const icon = <MyIcon {...i} key={i.name} />
        const title = (typeof i.title === 'function') ? (i.title as Function)(icon) : i.title
        return title ? <div className="flex gap-3 items-center relative" onClick={i.onClick}>{icon}
            {title}</div> : icon
    }

    const setup = (i: IconProps) => ({
        ...i, size: i.size || size || 12,
        visible: i.visible !== undefined ? i.visible : visible,
        className: i.className && ((i.className || '') + (props.itemClassName || '')),
        bgHover: i.bgHover !== undefined ? i.bgHover : props.bgHover
    })

    return <>{list.map(i => {
        if (i.name === 'more') {
            return <Dropdown key={i.name} menu={{
                items: moreIcons.map(k => ({ label: renderIcon({ ...(setup(k)), bgHover: false }), key: k.name }))
            }} trigger={['click']} >
                {renderIcon(setup(i))}
            </Dropdown >
        }
        return renderIcon(setup(i))
    })}</>
}

export const MyIcon = (props: IconProps) => {
    const { visible = true, name, size = 16, className = '' } = props
    let class_ = className || ''
    if (!className?.includes('fill')) {
        class_ += ' fill-gray-600 hover:fill-gray-800 dark:fill-gray-300 dark:hover:fill-white'
    }
    if (props.bgHover) {
        class_ += ' hover:bg-antdColorBgLayout dark:hover:bg-black p-1.5 rounded-sm'
    }
    const size_ = props.bgHover ? size - 1 : size
    const icon = <Icon
        style={props.style}
        onClick={props.onClick} className={classNames(
            '',
            !visible ? 'hidden' : '',
            !props.disabled ? 'cursor-pointer ' : 'cursor-default',
            class_
        )}
        // @ts-ignore
        icon={`local:${name}`}
        height={`${size_}`} width={`${size_}`} />
    return icon
}