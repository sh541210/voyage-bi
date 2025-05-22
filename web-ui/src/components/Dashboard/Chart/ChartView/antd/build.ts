const colorList: string[] = ['#5D7092', '#5B8FF9', '#5AD8A6', '#F6BD16']

export const buildConfig = (schema: { data: DataSet, chartType: ChartType, x: string[], y: string[], mobile: boolean }) => {
    const { data: { rows, columns }, chartType, x, y, mobile } = schema
    const data: Record<string, any>[] = rows?.map(list => {
        return columns.reduce((acc, cur, idx) => {
            acc[cur] = list[idx]
            return acc
        }, {} as any)
    })
    let config: any = {
        data,
        itemBackgroundFillOpacity: 100,
        autoFit: true,
        theme: 'classic',
    }
    if (y.length > 1) {
        config.legend = {
            color: {
                title: false,
                position: mobile ? 'top' : 'right',
                rowPadding: 5,
            },
        }
    }
    if (chartType === 'LINE') {
        config.xField = x
        config.children = y.map((i, idx) => {
            const item: any = {
                type: 'line',
                yField: i,
                style: {
                    lineWidth: 3,
                },
                shapeField: 'smooth',
                axis: {
                    y: {
                        position: idx % 3 == 0 ? 'right' : 'left',
                        title: i,
                        style: { titleFill: '#333' },

                    },
                    x: {
                        labelAutoHide: true,
                        labelAutoRotate: false,
                    }
                },
            }
            if (data.length > 0) {
                const number = data[0][i]
                if (data.filter(j => j[i] === number).length === data.length) {
                    item.scale = {
                        y: { domainMin: 0, domainMax: number > 100 ? number : 100 }
                    }
                }
            }
            return item
        })
    } else if (chartType === 'COLUMN') {
        if (data.length == 1) {
            return {
                ...config, colorField: 'type', yField: 'value', stack: true,
                label: {
                    text: 'value',
                    textBaseline: 'bottom',
                    position: 'inside',
                },
                data: y.map(i => ({ value: data[0][i], type: i }),)
            }
        } else {
            config.xField = x
            config.children = y.map((i, idx) => {
                const item: any = {
                    type: 'line',
                    yField: i,
                    style: {
                        lineWidth: 3,
                    },
                    shapeField: 'smooth',
                    axis: {
                        y: {
                            position: idx % 3 == 0 ? 'right' : 'left',
                            title: i,
                            style: { titleFill: '#333' },

                        },
                        x: {
                            labelAutoHide: true,
                            labelAutoRotate: false,
                        }
                    },
                }
                if (data.length > 0) {
                    const number = data[0][i]
                    if (data.filter(j => j[i] === number).length === data.length) {
                        item.scale = {
                            y: { domainMin: 0, domainMax: number > 100 ? number : 100 }
                        }
                    }
                }
                return item
            })
        }
    } else if (chartType === 'PIE') {
        data.forEach((item: any) => {
            y.forEach(key => {
                const value = item[key];
                if (value !== undefined && !isNaN(Number(value))) {
                    item[key] = Number(value);
                }
            });
        });
        const total = data.map(i => i[y[0]]).reduce((acc, curr) => acc + curr, 0)
        config = {
            ...config,
            angleField: y[0],
            colorField: x[0],
            label: {
                text: (data: any) => {
                    return `${data[x[0]]}\n${(parseInt(data[y[0]]) / total * 100).toFixed(2)}%`
                },
                position: (data.length) > 3 ? 'outside' : 'inside',
                fontWeight: 500,
                fontSize: (data.length) <= 3 ? 18 : 12,
                transform: [
                    {
                        type: 'overlapHide',
                    },
                ],
            },
            tooltip: (
                data: any
            ) => {
                return {
                    title: x[0],
                    value: `${data[x[0]]}\n${(parseInt(data[y[0]]) / total * 100).toFixed(2)}%\t(${data[y[0]]})`
                }
            }
        }
        if (data.length > 4) {
            config.insetTop = 20
        }
    } else if (chartType === 'WORD_CLOUD') {
        if (x.length == 0 || y.length == 0) {
            return config
        }
        config.data = data.map(i => ({ text: i[x[0]], value: i[y[0]] }))
        config.colorField = 'text'
    } else if (chartType === 'LIQUID') {
        config.percent = data[0][y[0]] / 100
    }
    return config
}
