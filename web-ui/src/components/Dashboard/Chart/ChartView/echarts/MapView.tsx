import ReactEChartsCore, { EChartsReactProps } from "echarts-for-react";
import { ChartViewProps } from "..";
import { useCallback, useEffect, useState } from "react";
import { useModel } from "@umijs/max";
import * as echarts from 'echarts/core';
import { MapChart } from 'echarts/charts'
import { Breadcrumb } from "antd";

echarts.use([MapChart])
export interface MapData extends MapRgistery {
    code: number
    name: string
}

export interface MapRgistery { level: number, codes: number[], names: string[] }
export const mapLevelTypes: MapLevelType[] = ['country', 'province', 'city', 'area']

const EchartsMapView = (props: ChartViewProps & {
    config: EChartsReactProps,
}) => {
    const [state, setState] = useState<MapRgistery>({ level: 0, codes: [0], names: ['全国'] });
    const global = useModel('global')
    const [loaded, setLoaded] = useState<boolean>(false)
    const mapName = `${props.chartId}_map`

    const registerMap = async () => {
        try {
            const { default: mapJson } = await import(`@/assets/map/${mapLevelTypes[state.level]}/${state.codes[state.level]}.json`);
            console.log(`${props.chartId}加载${state.names[state.level]}地图`)
            // @ts-ignore
            echarts.registerMap(mapName, { geoJSON: mapJson });
            setLoaded(true)
        } catch (error) {
            setLoaded(false)
            console.error("加载地图失败:", error);
        }
    };
    useEffect(() => {
        registerMap()
    }, [state])


    const handleChartClick = useCallback((e: any) => {
        if (!state) {
            return
        }
        const name = e.name
        const code = echarts.getMap(mapName).geoJSON.features
            .find((i: any) => i.properties.name === name)
            ?.properties.adcode
        const level = state.level + 1
        let newState = {
            codes: [...state.codes.slice(0, level), code],
            names: [...state.names.slice(0, level), name],
            level,
            loaded: false
        }
        props.onGraphEvent?.({ name: 'mapClick', data: { ...newState, code, name } })
        setState(newState)
    }, [state])

    const getOptions = () => {
        const option = props.config.option
        const index0 = state.level === 0
        return {
            ...option,
            series: option.series.map((i: any) => ({
                ...i, map: mapName,
                top: index0 ? '5%' : '10%',
                zoom: index0 ? 1.5 : 1.1,
                center: index0 ? [104.114129, 37.550339] : null
            }))
        }
    }

    return (
        <div className="h-full w-full relative">
            {state.level > 0 && <div className=" absolute bottom-2 left-3 z-30">
                <Breadcrumb items={state.names.map((i, idx) => ({
                    title: <div className=" cursor-pointer">{i}</div>, onClick: () => {
                        setLoaded(false)
                        props.onGraphEvent?.({
                            name: 'mapClick', data: {
                                ...state, code: state.codes[idx],
                                name: state.names[idx], level: idx,
                                names: state.names.slice(0, idx + 1),
                            }
                        }).then(() => {
                            setState({
                                ...state, level: idx,
                                names: state.names.slice(0, idx + 1),
                            })
                        })
                    }
                }))} />
            </div>}
            {loaded ? <ReactEChartsCore
                echarts={echarts}
                onEvents={{ click: handleChartClick }}
                theme={global.dark ? 'dark' : ''}
                {...props.config}
                option={getOptions()}
                style={{ height: "100%", width: "100%" }} // 设置图表大小
            /> : <div className="flex flex-col justify-center items-center">
                <div className="mt-10">暂无地图</div></div>}
        </div>
    );
};

export default EchartsMapView;