import React from 'react';
import ReactECharts from 'echarts-for-react';

const EchartsBarChart = () => {
  const option = {
    title: {
      text: '柱状图点击事件示例',
    },
    // tooltip: {
    //   trigger: 'item', // 提示框触发类型为 item，表示触发单个数据项
    // },
    xAxis: {
      type: 'category',
      data: ['A', 'B', 'C', 'D', 'E'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: [10, 20, 30, 40, 50],
        type: 'bar',
        name: '示例系列',
      },
    ],
  };

  // 点击事件处理函数
  const onChartClick = (params: any) => {
    // params 是点击事件的回调参数，包含点击的具体数据
    alert(`你点击了: ${params.name}, 值为: ${params.value}`);
  };

  return (
    <ReactECharts
      option={option}
      onEvents={{
        // 监听 click 事件
        click: onChartClick,
      }}
    />
  );
};

export default EchartsBarChart;