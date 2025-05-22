import { MyIcon } from "@/components/base/MyIcon"
import { useModel } from "@umijs/max"
import { message } from "antd"
import classNames from "classnames"
import { CSSProperties } from "react"

export const ThemeSwitch = (props: { style?: CSSProperties, className?: string }) => {
    const global = useModel('global')
    return <div className={classNames('cursor-pointer hover:bg-gray-200 dark:hover:bg-black', props.className)}
        style={{ ...props.style, zIndex: 500 }}
        onClick={() => {
            const dark = !global.dark
            global.setDark(dark)
            setTimeout(() => {
                message.success(`切换到${dark ? '🌛深色' : '☀️浅色'}模式`, .9)
            }, 300)
        }}>
        <MyIcon size={18} name={global.dark ? 'moon' : 'sun'}
            className={classNames('px-2 anticon',
                !global.dark ? 'fill-yellow-500 ' : ' dark:fill-gray-500')} />
    </div>
}