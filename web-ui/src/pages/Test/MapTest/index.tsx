import EchartsMapView from "@/components/Dashboard/Chart/ChartView/echarts/MapView";

const MapTest = () => {
    const allProvinces = [
        '宁夏', '黑龙江', '河北', '西藏', '山东', '辽宁', '青海', '广东', '甘肃', '天津', '新疆', '贵州', '四川', '江西', '湖北', '福建', '江苏', '浙江', '安徽', '海南', '重庆', '广西', '香港', '湖南', '云南', '河南', '内蒙古', '吉林', '台湾', '上海', '澳门', '北京', '陕西', '山西', '南海诸岛', '十段线'
    ];
    const extraRegion = (name: string) => ['南海诸岛', '十段线', '香港', '澳门'].includes(name)
    const extraRegion2 = (name: string) => ['南海诸岛', '十段线'].includes(name)


    const ellipses = [
        { width: 84, height: 58, opacity: 0.2 },
        { width: 58, height: 40, opacity: 0.4 },
        { width: 28, height: 18, opacity: 1 }
    ];

    const config = {
        option: {
            backgroundColor: "transparent",
            geo: [
                {
                    roam: false,
                    layoutCenter: ['50%', '55.5%'],
                    layoutSize: '120%',
                    itemStyle: {
                        areaColor: '#242424',
                        borderWidth: 0
                    },
                    silent: true,
                    regions: [{ name: '南海诸岛', itemStyle: { opacity: 0 } }, { name: '十段线', itemStyle: { opacity: 0 } }]
                },
                {
                    roam: false,
                    layoutCenter: ['50%', '53.5%'],
                    layoutSize: '120%',
                    itemStyle: {
                        areaColor: "#4B412A",
                        borderWidth: 0
                    },
                    silent: true,
                    regions: [{ name: '南海诸岛', itemStyle: { opacity: 0 } }, { name: '十段线', itemStyle: { opacity: 0 } }]
                },
                {
                    roam: false,
                    layoutCenter: ['50%', '52%'],
                    layoutSize: '120%',
                    itemStyle: {
                        areaColor: '#984800',
                        borderWidth: 0
                    },
                    silent: true,
                    regions: [{ name: '南海诸岛', itemStyle: { opacity: 0 } }, { name: '十段线', itemStyle: { opacity: 0 } }]
                },
                // 外边框层
                // {
                //     roam: false,
                //     layoutCenter: ['50%', '50%'],
                //     layoutSize: '120%',
                //     itemStyle: {
                //         areaColor: '#4E4030',
                //         borderColor: '#F19F01',
                //         borderWidth: 1.5
                //     },
                //     silent: true,
                //     // z: 12,
                //     regions: [{ name: '南海诸岛', itemStyle: { opacity: 0 } }, { name: '十段线', itemStyle: { opacity: 0 } }]
                // },
                {
                    roam: false,
                    silent: true,
                    itemStyle: {
                        areaColor: 'transparent',
                        borderColor: 'transparent',
                    },
                    layoutCenter: ['53%', '50%'],
                    layoutSize: '120%',
                    regions: allProvinces.map(name => ({
                        name,
                        itemStyle: {
                            areaColor: extraRegion2(name) ? 'F19F01' : 'transparent', // 只有南海诸岛显示红色
                            borderColor: extraRegion2(name) ? '#F19F01' : 'transparent',
                        },
                        label: { show: false }
                    }))
                }
            ],
            visualMap: {
                show: false,
                min: 0,
                max: 100000000,
                inRange: {
                    color: ['#AE885A'], // 有值区域颜色
                },
                outOfRange: {
                    color: ['#4E4030'] // 无值区域颜色
                }
            },
            universalTransition: true, // 尽量启用动画
            animation: true,
            animationDuration: 800,
            animationDelay: function (idx: number) {
                return idx * 600;
            },
            animationEasing: 'cubicOut',
            series: [
                {
                    name: 'map',
                    z: 11,
                    type: "map",
                    itemStyle: {
                        areaColor: "transparent",
                        emphasis: {
                            show: false,
                            areaColor: null
                        }
                    },
                    label: {
                        fontSize: 20,
                        show: true, // 显示省份名称
                        color: '#fff',  // 标签文字颜色
                    },
                    layoutCenter: ['50%', '50%'], // 地图中心相对容器居中
                    layoutSize: '119.4%',
                    data: [
                        { name: "浙江", value: 11 },
                        { name: "北京", value: 11 },
                        { name: "山西", value: 11 },
                    ],
                },
                {
                    name: 'shink',
                    type: 'scatter',
                    coordinateSystem: 'geo',
                    symbol: 'image://http://fusb.top/data/live/shrink.gif',
                    symbolSize: [84, 84],
                    data: [
                        {
                            name: '广东',
                            value: [113.26653, 23.132191]
                        }
                    ],
                    z: 15
                }
            ]
        }
    }
    const option = config.option

    // @ts-ignore
    const valueMap = new Map(option.series[0].data.map(item => [item.name, item]));
    const provinceLabelConfig: any = {
        '北京': { offset: [0, -10], vertical: true },
        '天津': { offset: [0, 10], vertical: true },
        '河北': { offset: [-15, 30], vertical: true },
        '内蒙古': { offset: [0, 25] },
        '甘肃': { offset: [-70, -45] },
        '台湾': { offset: [10, -20], vertical: true },
        '安徽': { offset: [0, -0], vertical: true },
        '江苏': { offset: [5, 0], vertical: true },
        '陕西': { offset: [0, 25] },
        '辽宁': { offset: [15, 0] },
        '上海': { offset: [5, -10], vertical: true },
        '宁夏': { offset: [0, 0], vertical: true }
    };

    // 统一构造完整的 series.data（有值/无值都写进去）
    // @ts-ignore
    option.series[0].data = allProvinces.map(name => {
        const hasValue = valueMap.has(name);
        const cfg = provinceLabelConfig[name] || {};
        return {
            name,
            // @ts-ignore
            value: hasValue ? valueMap.get(name).value : null,
            itemStyle: {
                borderWidth: 1.5,
                borderColor: '#6C5A38',
                areaColor: hasValue ? '#AE885A' : '#4E4030',
                opacity: !extraRegion(name) ? 1 : 0
            },
            label: {
                color: hasValue ? '#FFFFFF' : '#AFAFAF',
                show: !extraRegion(name),
                offset: cfg.offset || [0, 0],
                rotate: cfg.rotate || 0,
                formatter: cfg.vertical
                    ? (params) => params.name.split('').join('\n') // 竖排
                    : '{b}' // 默认显示省份名称
            }
        };
    });
    return <div className="bg-white h-full w-full">
        {/* @ts-ignore */}
        <EchartsMapView config={config} />
    </div>
}

export default MapTest