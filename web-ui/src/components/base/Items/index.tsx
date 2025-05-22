import { COLORS } from "@/constants"
import { getColorFromString } from "@/utils/common/common"
import { CloseCircleFilled, PlusOutlined } from "@ant-design/icons"
import { Tag } from "antd"
import classNames from "classnames"
import { CSSProperties, JSX, useEffect, useState } from "react"

interface ItemsProps<T> {
    title?: string
    list?: T[]
    renderContent: (index: number, t: T) => JSX.Element | undefined
    width?: number
    height?: number
    mode?: 'vertical' | 'horizontal'
    style?: CSSProperties
    onRemove?: (index: number) => void
    onAdd?: () => void
}

const Items = <T extends LabelItem>(props: ItemsProps<T>) => {
    const { width = 200, height = 30, mode = 'vertical' } = props
    const [activeIndex, setActiveIndex] = useState<number>(0)
    const { list = [] } = props

    useEffect(() => {
        if (list.length > 0) {
            if (activeIndex >= list.length) {
                setActiveIndex(activeIndex - 1)
            }
        }
    }, [list, activeIndex])

    const vertical = mode === 'vertical'
    return <div style={{ ...(props.style || {}) }}
        className={classNames('flex h-full w-full relative border dark:border-antdDarkBorder bg-antdColorBgLayout dark:bg-black',
            !vertical ? ' flex-col' : 'flex-row')}>
        <div className={classNames('flex relative dark:border-antdDarkBorder border-r overflow-auto p-2 gap-2',
            vertical ? ' flex-col h-full' : 'flex-row w-full border-b overflow-x-auto')}
            style={{ [vertical ? 'width' : 'height']: `${vertical ? width : height}px` }}>
            {list.map((i, idx) => <div className={classNames(' cursor-pointer bg-white dark:bg-antdDarkContainer border',
                vertical ? ' px-2 py-3' : 'py-1 px-4 flex-shrink-0',
                idx === activeIndex ? 'bg-white dark:bg-antdDarkContainer border-primaryColor' : ' dark:border-antdDarkBorder')}
                key={idx}
                onClick={() => setActiveIndex(idx)}>
                <div className=" flex flex-col justify-between group relative">
                    {i.title || `${props.title}${idx + 1}`}
                    <div className="flex mt-2">{i.labels && i.labels.filter(i => i !== undefined && i !== null).map(j =>
                        <Tag className=" text-xs" key={j} color={getColorFromString(j, COLORS)}>{j}</Tag>)}
                    </div>
                    {props.onRemove && <CloseCircleFilled className="text-lg opacity-0 group-hover:opacity-100
                     group-hover:text-antdColorFillSecondary hover:text-black absolute top-0 right-0
                      dark:group-hover:text-antdDarkColorFill dark:hover:text-white"
                        onClick={(e) => {
                            e.stopPropagation()
                            props.onRemove?.(idx)
                        }} />}
                </div>
            </div>)}
            {props.onAdd !== undefined && <div className="px-2 py-3 border dark:border-antdDarkBorder bg-white dark:bg-black
            hover:text-primaryColor dark:hover:text-primaryColor/80 cursor-pointer text-center hover:bg-gray-50
             dark:hover:bg-antdDarkColorFillTertiary flex items-center w-full"
                onClick={() => {
                    props.onAdd?.()
                    setActiveIndex(list.length)
                }}><PlusOutlined className=" text-base mr-2" />新增{props.title}</div>}
        </div>
        {activeIndex !== undefined && <div style={{ [vertical ? 'width' : 'height']: `calc(100% - ${width}px)` }} className="h-full" >
            {activeIndex !== list.length && props.renderContent(activeIndex, list[activeIndex])}
        </div>}
    </div>
}

export default Items