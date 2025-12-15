import { GridType } from "@/constants";
import { CHART_INTERACTION_LABEL } from "@/constants/ChineseMapping";
import { distinctByKey, parseTemplate } from "@/utils/common/common";
import { Tooltip } from "antd";
import classNames from "classnames";
import React, { ReactNode, useState } from "react";
import { useEffect, useRef } from "react";
import ChartView, { GraphEvent } from "../Dashboard/Chart/ChartView";
import { ChartGridPros, chartTabs } from "../Dashboard/Chart/ChartGrid";
import BaseModal from "../base/BaseModal";
import { MyIcon } from "../base/MyIcon";
import request from "@/utils/request";
import { useModel } from "@umijs/max";

interface ChartInteractionEventBusProps extends ChartGridPros {
    onDataUpdate: (dataRequest: ChartDataRequest, callback: (result: DataResult) => void) => void
}

interface ModalChart {
    chart?: ChartVO
    dataRequest: ChartDataRequest
}

export const useChartInteractionEventBus = (props: ChartInteractionEventBusProps) => {
    const { chartInteractionCfgs: cfgs, groups } = props
    const [modalChart, setModalChart] = useState<ModalChart>()
    const modalRef = useRef<any>(null)
    const [passParameterValues, setPassParameterValues] = useState<{ [chartId: number]: any }>()
    const { hiddenInteractionIcon } = useModel('global')

    useEffect(() => {
        groups.forEach(i => {
            if (!tabsRefs.current[`group_${i.id}`]) {
                tabsRefs.current[`group_${i.id}`] = React.createRef();
            }
            i.cfg.chartTabs?.map(i => i.chartIds[0]).filter(i => i).forEach(i => {
                if (!tabsRefs.current[`chart_tabs_${i}`]) {
                    tabsRefs.current[`chart_tabs_${i}`] = React.createRef();
                }
            })
        });
    }, [groups]);
    const tabsRefs = useRef<Record<string, React.RefObject<any>>>({})

    const triggerEvent = (params: {
        type: 'group' | 'chart',
        sourceType: SourceType,
        event: SourceEvent,
        id: number,
        data: DataSet | GraphEvent | undefined,
        rowIndex?: number | undefined | null,
        colIndex?: number | undefined | null
        predicate?: (cfg: ChartInteractionCfg) => boolean,
    }) => {
        let { type, sourceType, event, id, data, rowIndex, colIndex, predicate } = params
        cfgs.filter(i => i.source === `${type}_${id}` &&
            sourceType === i.sourceType &&
            event === i.sourceEvent &&
            (!predicate || predicate(i))
        ).forEach(i => {
            const chart = props.charts.find(c => c.id === getId(i.source))
            if (sourceType !== 'group' && !chart) {
                return
            }
            if (i.targetEvent === 'switchGroupLabel') {
                const tabs = chartTabs(groups, getId(i.target), i.tab)
                const primaryTab = tabs?.chartIds[0]
                if (tabs?.chartIds.includes(i.tab)) {
                    tabsRefs.current[`chart_tabs_${primaryTab}`].current?.changeTab(i.tab)
                }
                i.target && tabsRefs.current[i.target]?.current?.changeTab(i.tab)
            } else if (i.targetEvent === 'openChartModal') {
                openChartModal(i, data as DataSet, rowIndex || 0)
            } else if (i.targetEvent === 'passParameters') {
                if (['default', 'tableAction'].includes(i.sourceType)) {
                    setPassParameterValues(passParameterValues => ({
                        ...passParameterValues,
                        [getId(i.target)]: { ...getParameterValues(i, data as DataSet, rowIndex || 0, colIndex) }
                    }))
                } else if (i.sourceType === 'graph') {
                    let event = data as GraphEvent
                    const parameters = Object.keys(i.paramsMappings).reduce((acc, cur) => {
                        const value = parseTemplate(i.paramsMappings[cur], event.data)
                        acc[cur] = value
                        return acc
                    }, {} as any)
                    setPassParameterValues(passParameterValues => ({ ...passParameterValues, [getId(i.target)]: { ...parameters } }))
                }
            } else if (i.targetEvent === 'exportChartData') {
                const chartId = getId(i.target)
                request.EXPORT(new Date().getTime().toString(),
                    '/chart/data/export', {
                    chartId, parameters: {
                        ...getParameterValues(i, data as DataSet, rowIndex || 0)
                    }, env: props.env
                })
            }
        })
    }

    const getParameterValues = <T extends ParametersTarget>(cfg: T, dataSet: DataSet | undefined, rowIndex: number, colIndex?: number | null) => {
        let parameters: any = {}
        Object.keys(cfg.paramsMappings).forEach(j => {
            let value = cfg.paramsMappings[j]
            if (value.startsWith("${") && value.endsWith("}")) {
                const index = dataSet?.columns.findIndex(i => i === value.substring(2, value.length - 1))
                if (index !== undefined && index > -1) {
                    const line = dataSet?.rows[rowIndex]
                    value = line?.[index]
                }
            } else {
                parameters[j] = value
            }
            parameters[j] = value
        })
        return parameters
    }

    const openChartModal = async (cfg: OpenChartModalTarget, dataSet: DataSet | undefined, rowIndex: number) => {
        const chartId = getId(cfg.target)
        const parameters = getParameterValues(cfg, dataSet, rowIndex)
        setModalChart(undefined)
        const chart = props.charts.find(i => i.id === chartId)
        setModalChart({
            chart, dataRequest: {
                // env: 'default',
                chartId, parameters
            }
        })
        modalRef.current.open()
    }

    const getId = (str: string | null) => Number(String(str)?.split('_')[1])

    return {
        // 图表MODAL
        modalContext: <BaseModal
            footer={null}
            height={props.mode === 'mobile' ? 300 : 800}
            width={props.mode === 'mobile' ? '90%' : '60%'}
            ref={modalRef}
            title={modalChart?.chart?.name}>{modalChart?.chart && <ChartView
                chartParameters={{}}
                chartId={modalChart.chart.id}
                dataRequest={modalChart.dataRequest}
                onDataUpdate={props.onDataUpdate}
                mobile={props.mode === 'mobile'}
                graphRenderType={props.graphRenderType}
                renderCode={props.chartRenderCode}
                yColumns={modalChart?.chart.cfg.values}
                xColumns={modalChart?.chart.cfg.groupBy}
                chartType={props.mode === 'mobile' && modalChart?.chart.mobileType ? modalChart?.chart.mobileType : modalChart?.chart.type}
                chartStyleCfg={modalChart?.chart.styleCfg}
            />}
        </BaseModal>,
        // 触发事件
        triggerEvent,
        triggerGraphEvent: (chartId: number, event: GraphEvent) => {
            triggerEvent({
                type: 'chart', sourceType: 'graph',
                event: event.name, id: chartId, data: event,
            })
        },
        // onClick事件
        itemOnClick: (id: ChartGroupVO['id'] | ChartVO['id'], type: GridType, dataSet: DataSet | undefined) =>
            triggerEvent({ type, sourceType: 'default', event: 'onClick', id, data: dataSet }),
        // 待绑定标签REFS
        tabsRefs,
        onTabChange: (groupId: number, value: string | number) => {
            triggerEvent({
                type: 'group', sourceType: 'group', event: 'tabChange',
                id: groupId, data: undefined,
                // @ts-ignore
                predicate: cfg => (cfg as CIC7).changedTab === value
            })
        },
        onInnerTabChange: (bindId: number, index: number) => {
            groups.forEach(i => {
                i.cfg.chartTabs?.forEach(j => {
                    if (j.chartIds[0] === bindId) {
                        const tab = j.chartIds[index]
                        tabsRefs.current[`chart_tabs_${bindId}`]?.current?.changeTab(tab)
                    }
                })
            })
        },
        // 标签是否隐藏
        tabHidden: (id: ChartGroupVO['id']): boolean => cfgs.filter(i => i.targetEvent === 'switchGroupLabel'
            && i.target === `group_${id}` && i.hideTabs).length > 0,
        // 联动图表
        icon: (id: ChartGroupVO['id'] | ChartVO['id'], className?: string): ReactNode | undefined => {
            if (hiddenInteractionIcon) {
                return
            }
            const sourceCfgs = distinctByKey(cfgs.filter(i => getId(i.source) === id), 'source')
            const targetCfgs = distinctByKey(cfgs.filter(i => getId(i.target) === id), 'target')
            const index = sourceCfgs.length > 0 && targetCfgs.length > 0 ? 2 :
                (sourceCfgs.length > 0 ? 1 : 0)
            if (sourceCfgs.length > 0 || targetCfgs.length > 0) {
                return <div className={classNames('text-gray-600 cursor-pointer !z-[300]', className,
                    props.displayMode === 'preview' ? 'px-1 py-1' : 'py-1 px-2'
                )}
                    style={{ zIndex: 300 }}>
                    <Tooltip placement='rightTop' title={<div>
                        {sourceCfgs.length > 0 && <div>事件：{sourceCfgs.map(i => CHART_INTERACTION_LABEL[i.sourceType]
                            + CHART_INTERACTION_LABEL[i.sourceEvent] + CHART_INTERACTION_LABEL[i.targetEvent])}</div>}
                        {targetCfgs.length > 0 && <div>受控：{targetCfgs.map(i => CHART_INTERACTION_LABEL[i.targetEvent])}</div>}
                    </div>}><div><MyIcon size={props.displayMode === 'preview' ? 16 : 20} name='link4'
                        className={classNames('font-bold', ['fill-yellow-500', 'fill-green-500', 'fill-blue-500'][index], className)} /></div>
                    </Tooltip>
                </div>
            }
        },
        // 表格操作点击
        tableActionOnClick: (id: ChartVO['id'], rowIndex: number, actionIndex: number, dataSet: DataSet | undefined) =>
            triggerEvent({
                type: 'chart', sourceType: 'tableAction',
                event: 'onClick', id,
                data: dataSet,
                rowIndex,
                // 根据操作下标过滤
                predicate: i => {
                    return (i as TableActionSource).actionIndex === actionIndex
                }
            }),
        // 需要隐藏的被联动图表
        // @ts-ignore
        hideModalChartIds: cfgs.filter(i => ['openChartModal', 'exportChartData'].includes(i.targetEvent) && i.hideChart)
            .map(i => getId(i.target)),
        passParameterValues
    }
}