// var wxCharts = require("wxcharts.js");
var wxCharts = require('./wxcharts-min.js');

/**获得宽度 */
function getWidth(rpx) {
  let windowWidth = 320;
  try {
    let res = swan.getSystemInfoSync();
    windowWidth = res.windowWidth * rpx / 750;
  } catch (e) {
    console.error('getSystemInfoSync failed!');
  }
  return windowWidth;
};

/**按百分比获得高度 */
function getPWinH(p) {
  let wh = 320;
  try {
    let res = swan.getSystemInfoSync();
    wh = Math.floor(res.windowHeight * p); //下舍入取整
  } catch (e) {
    console.error('getSystemInfoSync failed!');
  }
  return wh;
}

function random(f) {
  let a = Math.random() * f;
  return Number(a.toFixed(0));
}
/**配方产量报表 */
function show(v, cvid, categories, name, data, windowWidth, windowHeight, series) {
  // console.log(v,cvid)
  // let d = [];//模拟数据
  // for (let i = 0; i < 120; i++) {
  //   let item = {
  //     p: 'p' + i,
  //     d1: random(100),
  //     d2: random(100),
  //   }
  //   d.push(item);
  // }
  // let width = getWidth(750);
  // let categories = [];
  // let series = [{
  //   name: "票据方量",
  //   data: [],
  // }, {
  //   name: "生产方量",
  //   data: [],
  // }];
  // let dy = [];

  // for (let i = 0; i < d.length - 1; i++) {
  //   categories.push(d[i].p);
  //   series[0].data.push(d[i].d1);
  //   series[1].data.push(d[i].d2);
  // }
  return new wxCharts({
    canvasId: cvid,
    dataPointShape: false,
    animation: false,
    type: 'column',
    categories: categories,
    legend: false,
    series: series,
    yAxis: {
      min: 0,
      format: function (val) {
        return val;
      }
    },
    xAxis: {
      disableGrid: true
      // axisLine: false,
      // type: 'calibration',
    },
    enableScroll: true,
    width: windowWidth,
    height: windowHeight,
    dataLabel: true,
    extra: {
      column: {
        width: 10 //柱的宽度
      }
    }
  });
}

module.exports = {
  show: show
};