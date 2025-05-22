
// import { Column, DualAxes, Gauge, Liquid, Pie, WordCloud, Funnel } from '@ant-design/charts';
import { ChartViewProps } from '..';

// const chartComponents: Partial<Record<ChartType, React.ElementType>> = {
//     LINE: DualAxes,
//     PIE: Pie,
//     GUAGE: Gauge,
//     WORD_CLOUD: WordCloud,
//     LIQUID: Liquid,
//     COLUMN: Column,
//     FUNNEL: Funnel
// };

const AntdChartView = (props: ChartViewProps & { config: any }) => {
    // const { chartType, xColumns, yColumns, mobile } = props
    // const renderGraph = () => {
    //     if (chartType === 'MAP') {
    //         return <div style={{ height: 'calc(100% - 5px)', padding: '10px' }}>
    //         </div>
    //     }
    //     const ChartComponent = chartComponents[chartType];
    //     if (!ChartComponent) {
    //         return <div className=' text-center mt-20 text-gray-500 text-lg'>未找到图表组件</div>;
    //     }
    //     return <ChartComponent {...props.config} />;
    // }
    return <div className='h-full w-full'>
        {/* {renderGraph()} */}
    </div>
}

export default AntdChartView 