import { Tooltip } from "antd";
import classNames from "classnames";
import { JSX, ReactNode, useEffect } from "react";

interface ChartTypeProps {
    types?: ChartType[]
    value: ChartType[]
    onChange: (value: ChartType[]) => void
    xColumns: Column[]
    yColumns: Column[]
    checkType?: boolean
    size?: number
    hover?: boolean
}

import { useModel } from "@umijs/max";
import { MAX_COLUMN_COUNT } from "@/constants";
import { MyIcon } from "@/components/base/MyIcon";
import { useDynamicIcon } from "@/components/DynamicIcon";

// 生成tooltip内容
const generateTooltipContent = (component: ChartComponentVO): JSX.Element => {
    const list = component.props.limit
    return (<div>
        <div className=" text-base mb-1">{component.name}</div>
        {list.map((value, index) => {
            const xDesc = (Array.isArray(value.x)
                ? `${value.x[0]} 到 ${value.x[1] === MAX_COLUMN_COUNT ? '多个' : value.x[1]}`
                : `${value.x === MAX_COLUMN_COUNT ? '多个' : `${value.x}个`}`) + '维度';

            const yDesc = (Array.isArray(value.y)
                ? `${value.y[0]} 到 ${value.y[1] === MAX_COLUMN_COUNT ? '多个' : value.y[1]}`
                : `${value.y === MAX_COLUMN_COUNT ? '多个' : `${value.y}个`}`) + '指标';
            return (
                <div key={index}>
                    {!Array.isArray(value.x) && !Array.isArray(value.y) ? <div>{yDesc} {xDesc}</div> : <>
                        <div>{yDesc}</div>
                        <div>{xDesc}</div></>}
                    {index < list.length - 1 && <div>或</div>}
                </div>

            );
        })}
    </div>
    );
};

// 计算是否可以使用
const calcChartTypeEnabled = (props: ChartComponentProps, xSize: number, ySize: number) => {
    if (xSize == 0 && ySize == 0 && !props.allowEmptyData) {
        return false
    }
    let isValid = false;
    for (const value of props.limit) {
        const xValid = Array.isArray(value.x)
            ? xSize >= value.x[0] && xSize <= value.x[1]
            : xSize === value.x;

        const yValid = Array.isArray(value.y)
            ? ySize >= value.y[0] && ySize <= value.y[1]
            : ySize === value.y;

        if (xValid && yValid) {
            isValid = true;
            break; // 一旦找到符合条件的，就可以提前结束循环
        }
    }
    return isValid;
}

const ChartTypeSelector = (props: ChartTypeProps) => {
    const { chartComponents } = useModel('system')
    const { DynamicIcon } = useDynamicIcon()
    const { xColumns: x, yColumns: y, checkType = false,
        value: values = [],
        types,
        hover = true,
        size = 24
    } = props

    useEffect(() => {
        if (!checkType || (x.length == 0 && y.length == 0)) {
            return
        }
        chartComponents.filter(i => values.includes(i.code))
            .forEach(i => !calcChartTypeEnabled(i.props, x.length, y.length) && props.onChange(['TABLE']))
    }, [x, y])

    // 渲染图标
    const renderChartTypeIcon = (enabled: boolean, component: ChartComponentVO): ReactNode => {
        return component.id < 0 ? <MyIcon size={size} name={component.code} disabled={!enabled}
            className={classNames('', enabled ? 'fill-primaryColor hover:fill-primaryColor dark:fill-primaryColor' : 'fill-gray-300 dark:fill-gray-600')} /> :
            <DynamicIcon type={component.icon} style={{ fontSize: `${size}px` }} disabled={!enabled} className={classNames('',
                enabled ? 'text-primaryColor hover:text-primaryColor' : 'text-gray-300 dark:text-gray-600')}
            />
    }

    return <>
        <div className="flex items-center flex-wrap">{
            chartComponents
                .filter(i => !types || types?.includes(i.code as ChartType))
                .map(component => {
                    const enabled = calcChartTypeEnabled(component.props, x.length, y.length)
                    const code = component.code
                    return <Tooltip key={code} placement='top' title={hover && generateTooltipContent(component)}>
                        <div key={code} onClick={() => {
                            if (enabled) {
                                if (values?.includes(code) && values.length > 1) {
                                    props.onChange(values.filter(i => i !== code))
                                } else {
                                    props.onChange([code, ...values])
                                }
                            }
                        }} className={classNames('p-3 mr-1 mt-1 rounded-sm',
                            values?.includes(code) ? 'border-primaryColor bg-antdColorBgLayout dark:bg-antdDarkColorFillTertiary hover:bg-antdColorBgLayout  dark:hover:bg-antdDarkColorFillSecondary text-primaryColor' : '',
                            enabled ? 'hover:bg-gray-200/50 dark:hover:bg-antdDarkColorFillSecondary  cursor-pointer' : ' cursor-default')}
                            style={{ padding: '0.7rem' }}>
                            <div>
                                {renderChartTypeIcon(enabled, component)}
                            </div>
                        </div>
                    </Tooltip>
                })}
        </div>
    </>
}

export default ChartTypeSelector