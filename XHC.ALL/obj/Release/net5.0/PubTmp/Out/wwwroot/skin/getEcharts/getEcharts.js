
let convertData = function (geoCoordMap, data) {
    var res = [];
    for (var i = 0; i < data.length; i++) {
        var geoCoord = geoCoordMap[data[i].name];
        if (geoCoord) {
            geoCoord.push(data[i].value);
            res.push({
                name: data[i].name,
                value: geoCoord
            });
        }
    }
    return res;
};

//柱状曲线图
//参数  demo标签ID title标题 xcloumns横坐标（字符串数组） ycloumns纵坐标（对象{name:横坐标,value:数组}）
function getBarAndLine(demo, title, xcloumns, ycolumns) {
    let main = echarts.init(document.getElementById(demo));
    let leng = ycolumns.map(x => x.name) || [];;
    let yleng = ycolumns.map(x => {
        return {
            type: 'value',
            name: x.name,
            axisLabel: {
                formatter: '{value}'
            }
        }
    }) || [];;
    let seer = [];
    seer.push({
        name: ycolumns[0].name,
        type: 'bar',
        yAxisIndex: 0,
        data: ycolumns[0].value
    });
    seer.push({
        name: ycolumns[1].name,
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: ycolumns[1].value
    });
    let option = {
        title: {
            text: title,
            subtext: '',
            x: 'center'
        },
        color: ['#16abfe', '#ff7070'],
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                crossStyle: {
                    color: '#999'
                }
            }
        },
        toolbox: {
            itemSize: 16,
            itemGap: 18,
            right: 8,
            top: 10,
            show: true,
            feature: {
                saveAsImage: {
                    title: '下载数据视图',
                }
            }
        },
        legend: {
            x: 'center',
            y: 'bottom',
            data: leng
        },
        xAxis: [{
            type: 'category',
            data: xcloumns,
            axisPointer: {
                type: 'shadow'
            }
        }],
        yAxis: yleng,
        series: seer
    };
    main.setOption(option, true);
    return main;
}

//环状图
//参数  demo标签ID title标题 xcloumns横坐标（字符串数组） ycloumns纵坐标（对象{name:横坐标,value:数组}）
function getCircular(demo, title, xcloumns, ycolumns) {
    let main = echarts.init(document.getElementById(demo));
    let option = {
        title: {
            text: title,
            x: 'center',
            top: 12
        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} ({d}%)"
        },
        legend: {
            type: 'scroll',
            orient: 'vertical',
            x: 'left',
            top: 50,
            data: xcloumns,
            formatter: function (a) {
                if (!a) return ``;
                else if (a.length > 8) return a.substring(0, 8) + "...";
                return a;
            }
        },
        toolbox: {
            itemSize: 16,
            itemGap: 18,
            right: 8,
            top: 10,
            show: true,
            feature: {
                saveAsImage: {
                    title: '下载数据视图',
                }
            }
        },
        series: [
            {
                name: title,
                type: 'pie',
                center: ['60%', '58%'],
                radius: ['35%', '55%'],
                data: ycolumns,
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                label: {
                    normal: {
                        formatter: function (a) {
                            if (!a || !a.data || !a.data.name) return ``;
                            else if (a.data.name.length > 10) return a.data.name.substring(0, 10) + "...";
                            return a.data.name;
                        }
                    }
                }
            }
        ]
    };
    main.setOption(option, true);
    return main;
}

//世界地图
//参数  demo标签ID title标题 xcloumns横坐标（字符串数组） ycloumns纵坐标（对象{name:横坐标,value:数组}）
function getMapOut(demo, title, ycolumns) {
    var geoCoordMap = methos.CityInternalArr();
    let leng = ycolumns.map(x => x.name) || [];;
    let seer = ycolumns.map(x => {
        let max = x.value && x.value.length > 0 ? (20 / x.value[0].value).toFixed(4) : 0;
        return {
            name: x.name,
            type: 'effectScatter',
            coordinateSystem: 'geo',
            data: convertData(geoCoordMap, x.value),
            symbolSize: function (val) {
                let y = val[2] * max;
                if (y < 2) return 2;
                return y;
            },
            showEffectOn: 'render',
            rippleEffect: {
                brushType: 'stroke'
            },
            hoverAnimation: true,
            label: {
                normal: {
                    formatter: '{b}',
                    position: 'right',
                    show: true
                }
            },
            itemStyle: {
                normal: {
                    color: '#f4e925',
                    shadowBlur: 10,
                    shadowColor: '#333'
                }
            },
            zlevel: 1
        }
    }) || [];
    let main = echarts.init(document.getElementById(demo));
    let option = {
        backgroundColor: '#404a59',
        title: {
            text: title,
            subtext: '',
            sublink: '',
            left: 'center',
            textStyle: {
                color: '#fff'
            }
        },
        toolbox: {
            itemSize: 16,
            itemGap: 18,
            right: 8,
            top: 10,
            show: true,
            feature: {
                saveAsImage: {
                    title: '下载数据视图',
                }
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: function (a) {
                return `${a.name}<br>${a.seriesName}：${a.value[2]}`;
            }//悬浮窗显示规则
        },
        legend: {
            orient: 'vertical',
            y: 'bottom',
            x: 'right',
            data: leng,
            textStyle: {
                color: '#fff'
            }
        },
        geo: {
            map: 'world',
            label: {
                emphasis: {
                    show: false
                }
            },
            roam: true,
            itemStyle: {
                normal: {
                    areaColor: '#323c48',
                    borderColor: '#111'
                },
                emphasis: {
                    areaColor: '#2a333d'
                }
            }
        },
        series: seer
    };
    main.setOption(option, true);
    return main;
}

//中国地图
//参数  demo标签ID title标题 ycloumns纵坐标（对象{name:横坐标,value:数组}）
function getMapIn(demo, title, ycolumns) {
    let geoCoordMap = methos.CityArr();
    let leng = ycolumns.map(x => x.name) || [];;
    let seer = ycolumns.map(x => {
        let max = x.value && x.value.length > 0 ? (20 / x.value[0].value).toFixed(4) : 0;
        return {
            name: x.name,
            type: 'effectScatter',
            coordinateSystem: 'geo',
            data: convertData(geoCoordMap, x.value),
            symbolSize: function (val) {
                let y = val[2] * max;
                if (y < 2) return 2;
                return y;
            },
            showEffectOn: 'render',
            rippleEffect: {
                brushType: 'stroke'
            },
            hoverAnimation: true,
            label: {
                normal: {
                    formatter: '{b}',
                    position: 'right',
                    show: true
                }
            },
            itemStyle: {
                normal: {
                    color: '#f4e925',
                    shadowBlur: 10,
                    shadowColor: '#333'
                }
            },
            zlevel: 1
        }
    }) || [];
    let main = echarts.init(document.getElementById(demo));
    let option = {
        backgroundColor: '#404a59',
        title: {
            text: title,
            subtext: '',
            sublink: '',
            left: 'center',
            textStyle: {
                color: '#fff'
            }
        },
        toolbox: {
            itemSize: 16,
            itemGap: 18,
            right: 8,
            top: 10,
            show: true,
            feature: {
                saveAsImage: {
                    title: '下载数据视图',
                }
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: function (a) {
                return `${a.name}<br>${a.seriesName}：${a.value[2]}`;
            }//悬浮窗显示规则
        },
        legend: {
            orient: 'vertical',
            y: 'bottom',
            x: 'right',
            data: leng,
            textStyle: {
                color: '#fff'
            }
        },
        geo: {
            map: 'china',
            label: {
                emphasis: {
                    show: false
                }
            },
            roam: true,
            itemStyle: {
                normal: {
                    areaColor: '#323c48',
                    borderColor: '#111'
                },
                emphasis: {
                    areaColor: '#2a333d'
                }
            }
        },
        series: seer
    };
    main.setOption(option, true);
    return main;
}

//横向叠加柱状图
//参数  demo标签ID title标题 lenged展示字段 xcloumns横坐标（字符串数组） ycloumns纵坐标（对象{name:横坐标,value:数组}）
function getManyBarTransverseSuperposition(demo, title, xcolumns, ycolumns) {
    let leng = ycolumns.map(x => x.name) || [];;
    let seer = ycolumns.map(x => {
        return {
            name: x.name,
            type: 'bar',
            stack: `总量`,
            data: x.value
        };
    }) || [];
    let main = echarts.init(document.getElementById(demo));
    let option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
        },
        title: [{
            text: title,
            left: '1%',
            top: '6%',
            textStyle: {
                color: '#ff733f'
            }
        }],
        toolbox: {
            itemSize: 16,
            itemGap: 18,
            right: 8,
            top: 10,
            show: true,
            feature: {
                saveAsImage: {
                    title: '下载数据视图',
                }
            }
        },
        legend: {
            data: leng
        },
        grid: {
            left: '1%',
            right: '35%',
            top: '16%',
            bottom: '6%',
            containLabel: true
        },
        xAxis: {
            type: 'value'
        },
        yAxis: {
            type: 'category',
            data: xcolumns,
            axisLabel: {
                formatter: function (a) {
                    if (!a) return ``;
                    else if (a.length > 8) return a.substring(0, 8) + "...";
                    return a;
                }
            }
            
        },
        series: seer
    };
    main.setOption(option, true);
    return main;
}

//横向柱状图
//参数  demo标签ID title标题 lenged展示字段 xcloumns横坐标（字符串数组） ycloumns纵坐标（对象{name:横坐标,value:数组}）
function getBarTransverseSuperposition(demo, title, name, ycolumns) {
    let leng = ycolumns.map(x => x.name) || [];;
    let seer = [{
        "name": name,
        "type": "bar",
        "data": ycolumns,
        "barCategoryGap": "35%",
        "label": {
            "normal": {
                "show": true,
                "position": "right",
                "formatter": function (params) {
                    return params.data.value;
                },
                "textStyle": {
                    "color": "#0000AA"//"#bcbfff" //color of value
                }
            }
        },
        "itemStyle": {
            "normal": {
                "color": new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
                    "offset": 0,
                    "color": "#ffb069" // 0% 处的颜色
                }, {
                    "offset": 1,
                    "color": "#ec2e85" // 100% 处的颜色
                }], false)
            }
        }
    }];
    let main = echarts.init(document.getElementById(demo));
    let option = {
        title: {
            tex: title,
            textStyle: {
                color: "#bcbfff",
                fontWeight: "bold",
                fontSize: 14
            },
            top: "4%",
            left: "2.2%"
        },
        tooltip: {
            trigger: "axis",
            axisPointer: { // 坐标轴指示器，坐标轴触发有效
                type: "shadow" // 默认为直线，可选为："line" | "shadow"
            }
        },
        toolbox: {
            itemSize: 16,
            itemGap: 18,
            right: 8,
            top: 10,
            show: true,
            feature: {
                saveAsImage: {
                    title: '下载数据视图',
                }
            }
        },
        grid: {
            left: "3%",
            right: "10%",
            bottom: "3%",
            containLabel: true
        },
        yAxis: [{
            type: "category",
            data: leng,
            axisLine: {
                show: false
            },
            axisTick: {
                show: false,
                alignWithLabel: true
            },
            axisLabel: {
                textStyle: {
                    color: "#444444"//"#ffb069"
                },
                formatter: function (a) {
                    if (!a) return ``;
                    else if (a.length > 8) return a.substring(0, 8) + "...";
                    return a;
                }
            }
        }],
        xAxis: [{
            type: "value",
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                show: false
            },
            splitLine: {
                show: false
            }
        }],

        "series": seer
    };
    main.setOption(option, true);
    return main;
}