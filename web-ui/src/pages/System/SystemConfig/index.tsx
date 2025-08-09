import { useCollapse } from "@/utils/render"
import request from "@/utils/request"
import { useModel } from "@umijs/max"
import { Input } from "antd"
import FormItem from "antd/es/form/FormItem"

const SystemConfig = () => {
    const { renderCollapse } = useCollapse({ backgroundColor: 'transparent' })
    const { systemConfig } = useModel('system')
    return <div className="p-4 bg-white dark:bg-antdDarkContainer h-full">
        {renderCollapse('组件相关', <>
            <FormItem label='IconFont JS地址' >
                <Input variant='filled' defaultValue={systemConfig?.iconFontJsUrl} onChange={e => {
                    request.PUT('/system/config/value',
                        { configKey: 'iconFontJsUrl', value: e.target.value })
                }} />

            </FormItem>
            <FormItem label='首页仪表盘key' >
                <Input variant='filled' defaultValue={systemConfig?.homeDashboardKey} onChange={e => {
                    request.PUT('/system/config/value',
                        { configKey: 'homeDashboardKey', value: e.target.value })
                }} />
            </FormItem>
            <FormItem label='地图json地址' >
                <Input variant='filled' defaultValue={systemConfig?.chartsJsonAddr} onChange={e => {
                    request.PUT('/system/config/value',
                        { configKey: 'chartsJsonAddr', value: e.target.value })
                }} />
            </FormItem>
        </>)}
    </div>
}

export default SystemConfig