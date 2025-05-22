import ReactECharts, { EChartsReactProps } from "echarts-for-react";
import { ChartViewProps } from "..";
import { useCallback, useEffect, useState } from "react";
import { useModel } from "@umijs/max";
import * as echarts from 'echarts/core';
import { LineChart, BarChart, PieChart, FunnelChart } from 'echarts/charts'
import 'echarts-wordcloud'
import { ErrorBoundary } from "@/components/base/ErrorBoundary";
echarts.use([LineChart, BarChart, PieChart, FunnelChart])

const EchartsView = (props: ChartViewProps & { config: EChartsReactProps }) => {
  const [i, setI] = useState<number>(0)
  const global = useModel('global')
  useEffect(() => { setI(i + 1) },
    [props.chartType, props.config])

  return (
    <><ErrorBoundary title='echarts渲染出错'><ReactECharts
      echarts={echarts}
      key={`${props.chartId}${i}`}
      theme={global.dark ? 'dark' : ''}
      {...props.config}
      onEvents={{
        click: useCallback((params: any) => {
          props.onGraphEvent?.({ name: 'graphClick', data: { ...params } })
        }, []),
      }}
      style={{ height: "100%", width: "100%" }}
    /></ErrorBoundary></>
  );
};

export default EchartsView;