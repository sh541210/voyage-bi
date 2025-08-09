import ReactEChartsCore, { EChartsReactProps } from "echarts-for-react";
import { ChartViewProps } from "..";
import { useCallback, useEffect, useState } from "react";
import { useModel } from "@umijs/max";
import * as echarts from 'echarts/core';
import { MapChart } from 'echarts/charts'
import { Breadcrumb } from "antd";
import { getGeoJson } from "./data";
import { renderEmpty, renderLoading } from "@/utils/render";

echarts.use([MapChart])
export interface MapData extends MapRgistery {
    code: number
    name: string
}

export interface MapRgistery { level: number, codes: number[], names: string[] }
export const mapLevelTypes: MapLevelType[] = ['country', 'province', 'city', 'area']
const registeredMaps = new Set<string>()

const EchartsMapView = (props: ChartViewProps & {
    config: EChartsReactProps,
}) => {
    const [state, setState] = useState<MapRgistery>({ level: 0, codes: [0], names: ['全国'] });
    const global = useModel('global')
    const [loadState, setLoadState] = useState<number>(0)
    const current = (state: MapRgistery) => `${state.codes[state.level]}`
    const { systemConfig } = useModel('system')

    const registerMap = async (state: MapRgistery) => {
        try {
            const key = current(state)
            // if (!registeredMaps.has(key)) {
            setLoadState(0)
            const mapJson = await getGeoJson(systemConfig.chartsJsonAddr ||
                'http://file.geojson.cn/china/1.6.2/', state.codes)
            console.log(`${props.chartId}加载${state.names[state.level]}[${key}}]地图`)
            // @ts-ignore
            echarts.registerMap(key, mapJson);
            setLoadState(1)
            registeredMaps.add(key)
            // }
            // FIXME 有时候会变成100×100，暂时这样处理
            setTimeout(() => {
                setState(state)
            }, 300)
        } catch (error) {
            setLoadState(-1)
            setState(state)
            console.error("加载地图失败:", error);
        }
    };

    useEffect(() => {
        registerMap(state)
    }, [])

    const handleChartClick = useCallback((e: any) => {
        if (!state) {
            return
        }
        const name = e.name
        const code = echarts.getMap(current(state)).geoJSON.features
            .find((i: any) => i.properties.name === name)
            ?.properties.code
        const level = state.level + 1
        let newState = {
            codes: [...state.codes.slice(0, level), code],
            names: [...state.names.slice(0, level), name],
            level,
            loaded: false
        }
        props.onGraphEvent?.({ name: 'mapClick', data: { ...newState, code, name } })
        registerMap(newState)
    }, [state])

    const getOptions = () => {
        const option = props.config.option
        return {
            ...option,
            replaceMerge: ['series', 'geo'],
            geo: option.geo?.map((i: any) => ({ ...i, map: current(state) })),
            series: option.series.map((i: any) => (i.type !== 'map' ? i : {
                ...i,
                type: 'map',
                map: current(state)
            }))
        }
    }

    const renderGraph = () => {
        if (loadState == -1) {
            return renderEmpty('暂无地图')
        } else if (loadState == 1) {
            if (props.config) {
                if (state.level == 3) {
                    return
                }
                return <ReactEChartsCore
                    echarts={echarts}
                    onEvents={{ click: handleChartClick }}
                    theme={global.dark ? 'dark' : ''}
                    {...props.config}
                    option={getOptions()}
                    opts={{ renderer: 'svg' }}
                    style={{ height: "100%", width: "100%" }} // 设置图表大小
                />
            }
            return renderLoading('数据加载中')
        }
    }

    return (
        <div className="h-full w-full relative">
            {state.level > 0 && <div className=" absolute bottom-2 left-3 z-30">
                <Breadcrumb items={state.names.map((i, idx) => ({
                    title: <div className=" cursor-pointer">{i}</div>, onClick: async () => {
                        const result = props.onGraphEvent?.({
                            name: 'mapClick',
                            data: {
                                ...state,
                                code: state.codes[idx],
                                name: state.names[idx],
                                level: idx,
                                names: state.names.slice(0, idx + 1),
                            }
                        })
                        if (result && typeof result.then === 'function') {
                            await result
                        }
                        registerMap({
                            ...state,
                            codes: state.codes.slice(0, idx + 1),
                            level: idx,
                            names: state.names.slice(0, idx + 1),
                        });
                    }
                }))} />
            </div>}
            {renderGraph()}
        </div>
    );
};

export default EchartsMapView;