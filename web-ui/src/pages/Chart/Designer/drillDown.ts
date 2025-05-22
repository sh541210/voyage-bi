import { GraphEvent } from "@/components/Dashboard/Chart/ChartView"
import { MapData, mapLevelTypes } from "@/components/Dashboard/Chart/ChartView/echarts/MapView"
import { useState } from "react"

export const useDrillDowns = (onDrillDownParamChange?: (chartId: number, drillDownParam: DrillDownParam | undefined) => void) => {
    const [drillDownParams, setDrillDownParams] = useState<Record<number, DrillDownParam>>({})

    const onGraphEvent = (chart: ChartVO, event: GraphEvent) => {
        if (chart.type === 'MAP' && event.name === 'mapClick') {
            const mapping = chart.cfg.props.mapColumnMapping
            if (mapping) {
                const mapData = event.data as MapData
                let list = []
                for (let i = 0; i < mapData.level + 1; i++) {
                    const type = mapLevelTypes[i]
                    mapping[type] && list.push({ columnId: mapping[type], values: [mapData.names[i]] })
                }
                const param = {
                    filters: list,
                    columnId: mapping[mapLevelTypes[mapData.level + 1]]
                }
                setDrillDownParams(drillDownParams => ({ ...drillDownParams, [chart.id]: param }))
                onDrillDownParamChange?.(chart.id, list.length > 0 ? param : undefined)
                return Promise.resolve()
            }
        }
        return Promise.resolve()
    }

    return {
        drillDownParams,
        getDrillDownParam: (chartId: number) => drillDownParams[chartId],
        onGraphEvent
    }
}