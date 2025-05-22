import { MyIcon } from "@/components/base/MyIcon"
import { useModel } from "@umijs/max"
import { message } from "antd"
import classNames from "classnames"
import { CSSProperties } from "react"

export const DataModeSwitch = (props: { style?: CSSProperties, className?: string }) => {
    const global = useModel('global')
    return <div
        className={classNames('bg-transparent text-black dark:text-white cursor-pointer hover:bg-gray-200 dark:hover:bg-black', props.className)}
        onClick={() => {
            const mode = global.dataMode === 'CACHE' ? 'REAL_TIME' : 'CACHE'
            global.setDataMode(mode)
            message.success(`切换到${{ CACHE: '缓存数据', REAL_TIME: '实时数据' }[mode]}模式`)
        }}>
        <MyIcon size={18} name={global.dataMode}
            className="px-2 fill-primaryColor anticon" />
    </div>
}