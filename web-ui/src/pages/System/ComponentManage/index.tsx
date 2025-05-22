import { MyIcon } from "@/components/base/MyIcon"
import { useDynamicIcon } from "@/components/DynamicIcon"
import * as render from "@/utils/render"
import request from "@/utils/request"
import { PlusOutlined } from "@ant-design/icons"
import { history } from "@umijs/max"
import { message } from "antd"
import classNames from "classnames"
import { useEffect, useState } from "react"
import FormModal from "@/components/base/FormModal"
import { getDefaultScript, requiedRulesInput, requiredRuleSelect } from "@/constants"

const ComponentManage = () => {
    const [components, setComponents] = useState<ChartComponentVO[]>([])
    const { DynamicIcon, iconOptions } = useDynamicIcon()

    useEffect(() => {
        fetchComponents()
    }, [])

    const fetchComponents = () => request.GET('/chart/component/list/simple').then(setComponents)

    const classes = `relative rounded-md py-5 px-10 border dark:border-antdDarkBorder
                flex flex-col items-center gap-3 bg-white dark:bg-antdDarkContainer 
                cursor-pointer transition-all duration-300 min-h-[150px] min-w-[150px]
                dark:hover:bg-antdDarkColorFillSecondary hover:shadow-lg`
    return <div className="relative h-full p-4 bg-antdColorBgLayout dark:bg-black">
        {/* <ColorTest /> */}
        <div className="flex items-center flex-wrap gap-6 relative">
            {components.map(i => <div onClick={() => { history.push(`/system/chartComponents/chartComponent?id=${i.id}`) }}
                className={classNames(classes, {
                    react: 'hover:border-reactColor text-reactColor',
                    echarts: 'hover:border-echartsColor text-echartsColor'
                }[i.type])} key={i.id}>
                <MyIcon size={20} name={i.type} className="absolute top-2 right-2" />
                <DynamicIcon className="text-6xl" type={i.icon} />
                <div className="">
                    <div className="text-sm text-black dark:text-white">{i.name}</div>
                    <div className="text-xs">{i.code}</div>
                </div>
            </div>)}
            <FormModal<ChartComponentVO>
                onFinish={(values: any) => {
                    return request.POST('/chart/component', {
                        ...values, props: {
                            allowEmptyData: values.allowEmptyData,
                            limit: [{ x: [0, 100], y: [0, 100] }],
                            script: getDefaultScript(values.code.toUpperCase(), values.type)
                        }
                    }).then(id => {
                        message.success('添加成功!')
                        fetchComponents()
                        history.push(`/system/chartComponents/chartComponent?id=${id}`)
                        return true
                    })
                }}
                initialValues={{ type: 'echarts', props: {} }}
                title='添加新图表组件' columns={[
                    { key: 'code', title: '唯一标识', ...requiedRulesInput },
                    { key: 'name', title: '名称', ...requiedRulesInput },
                    { key: 'description', title: '描述', valueType: 'textarea' },
                    {
                        key: 'type', title: '类型', valueType: 'segmented',
                        ...requiredRuleSelect,
                        fieldProps: {
                            options: ['echarts', 'react'].map(i => ({ value: i, label: render.renderChartComponentType(i as ChartComponentType) }))
                        }
                    },
                    {
                        key: 'icon', title: '图标', width: 200, valueType: 'select',
                        ...requiredRuleSelect,
                        fieldProps: { showSearch: true, options: iconOptions }
                    }, { key: 'allowEmptyData', title: '允许空数据', valueType: 'switch' }
                ]}
                trigger={<div className={classNames(classes, 'h-full border-dotted text-antdColorTextTertiary hover:text-antdColorTextSecondary dark:text-antdDarkColorFillSecondary dark:hover:text-antdDarkColorFill')}>
                    <PlusOutlined className="text-6xl" />
                    <div className="text-sm">添加新组件</div>
                </div>} />
        </div>
    </div >
}

export default ComponentManage