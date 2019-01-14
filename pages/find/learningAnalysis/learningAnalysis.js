import api from '../../../api/api.js';
import request from '../../../api/request.js';
import common from '../../../utils/common.js';
var Charts = require('../../../utils/wxcharts-min.js');
var ic = require('../../../utils/initchart.js');
var app = getApp();
var lineChart = null;
var lineChart2 = null;

var bk_userinfo;
var sessionid;
var uid;
var courseid;
var coursename;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navigation: {
      leftBtn: 1,
      leftBtnImg: '../../../image/navigation/back.png',
      centerBtn: 0,
      centerBtnTitle: '学习分析'
    },
    arc_lData: {},
    arc_rData: {},
    correct_rate: 0, //正确率
    cicleStrtitle: '',
    cicleStr: '',
    cicleSymbol: '',
    avgscore: '',
    paiming: '',
    stats: '',
    tabindex: 0,
    clientHeight: 0,
    switchTabArr: ['直播时长', '视频时长', '刷题量', '正确率'],
    lineCanvasArr: [],
    leftTipHidden: true,
    rightTipHidden: true,
    leftTipStr: '',
    rightTipStr: '',
    coursename: '',

    canvasLen: 0,
    chart0: null,
    chart1: null,
    chart2: null,
    chart3: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    bk_userinfo = swan.getStorageSync('bk_userinfo');
    sessionid = app.globalData.default_sessionid;
    uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    courseid = swan.getStorageSync('courseid');
    coursename = swan.getStorageSync('coursename');
    this.setData({ coursename: coursename });
    this.mystats();
    /*获取屏幕宽度赋给cavas*/
    let windowWidth = '';
    let windowHeight = '';
    try {
      let res = swan.getSystemInfoSync();
      windowWidth = res.windowWidth;
      windowHeight = res.windowHeight;
      this.setData({ clientWidth: windowWidth });
      this.setData({ clientHeight: windowHeight });
    } catch (e) {
      // do something when get system info failed
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
  // //swiper滑动
  // handleChange: function (e) {
  //   var current = e.detail.current;
  //   this.setData({ tabindex: current });
  // },
  leftTipClick: function (event) {
    this.setData({ rightTipHidden: true });
    var str;
    var tabindex = this.data.tabindex;
    str = '全站平均' + this.data.switchTabArr[tabindex];
    this.setData({ leftTipStr: str });
    this.setData({ leftTipHidden: false });
    setTimeout(() => {
      this.setData({ leftTipHidden: true });
    }, 1000);
  },
  rightTipClick: function (event) {
    this.setData({ leftTipHidden: true });
    var str;
    var tabindex = this.data.tabindex;
    str = '全站' + this.data.switchTabArr[tabindex] + '排行';
    this.setData({ rightTipStr: str });
    this.setData({ rightTipHidden: false });
    setTimeout(() => {
      this.setData({ rightTipHidden: true });
    }, 1000);
  },
  // tab点击事件
  switchTabClick: function (event) {
    var index = event.currentTarget.dataset.index;
    if (index == 2) {
      swan.setNavigationBarTitle({
        title: '刷题数量'
      });
    } else {
      swan.setNavigationBarTitle({
        title: this.data.switchTabArr[index]
      });
    }
    let trend;
    switch (index) {
      case 0:
        var score = parseInt(this.data.analysis.live.totalduration / this.data.analysis.live.avgduration);
        if (score > 100) {
          score = 100;
        }
        this.setData({ correct_rate: score }); //默认能力值，tab切换后变化
        this.setData({ cicleStrtitle: '直播时长' });
        this.setData({ cicleStr: parseInt(this.data.analysis.live.totalduration / 60 / 60) }); //默认能力值，tab切换后变化
        this.setData({ cicleSymbol: '小时' }); //默认能力值，tab切换后变化
        this.setData({ avgscore: parseInt(this.data.analysis.live.avgduration / 60 / 60) + '小时' });
        this.setData({ paiming: this.data.analysis.live.paiming });
        trend = this.data.analysis.live.trend;
        break;
      case 1:
        var answertimes = parseInt(this.data.analysis.vod.totalduration / this.data.analysis.vod.avgduration);
        this.setData({ correct_rate: answertimes }); //默认能力值，tab切换后变化
        this.setData({ cicleStrtitle: '视频时长' });
        this.setData({ cicleStr: parseInt(this.data.analysis.vod.totalduration / 60 / 60) }); //默认能力值，tab切换后变化
        this.setData({ cicleSymbol: '小时' }); //默认能力值，tab切换后变化
        this.setData({ avgscore: parseInt(this.data.analysis.vod.avgduration / 60 / 60) + '小时' });
        this.setData({ paiming: this.data.analysis.vod.paiming });
        trend = this.data.analysis.vod.trend;
        break;
      case 2:
        var answertimes = parseInt(this.data.analysis.answer.answertimes / this.data.analysis.answer.avgtimes);
        if (answertimes > 100) {
          answertimes = 100;
        }
        this.setData({ correct_rate: answertimes }); //默认能力值，tab切换后变化
        this.setData({ cicleStrtitle: '总刷题数' });
        this.setData({ cicleStr: this.data.analysis.answer.answertimes }); //默认能力值，tab切换后变化
        this.setData({ cicleSymbol: '道' }); //默认能力值，tab切换后变化
        this.setData({ avgscore: this.data.analysis.answer.avgtimes + '道' });
        this.setData({ paiming: this.data.analysis.answer.paiming });
        trend = this.data.analysis.answer.trend;
        break;
      case 3:
        this.setData({ correct_rate: this.data.analysis.accuracy.accuracy }); //默认能力值，tab切换后变化
        this.setData({ cicleStrtitle: '总正确率' });
        this.setData({ cicleStr: this.data.analysis.accuracy.accuracy }); //默认能力值，tab切换后变化
        this.setData({ cicleSymbol: '%' }); //默认能力值，tab切换后变化
        this.setData({ avgscore: this.data.analysis.accuracy.avgaccuracy + '%' });
        this.setData({ paiming: this.data.analysis.accuracy.paiming });
        trend = this.data.analysis.accuracy.trend;
        break;
      default:
        break;
    }

    for (var i = 0; i < this.data.lineCanvasArr.length; i++) {
      if (index == i) {
        this.data.lineCanvasArr[i].canvasHidden = false;
      } else {
        this.data.lineCanvasArr[i].canvasHidden = true;
      }
    }
    this.setData({ lineCanvasArr: this.data.lineCanvasArr });
    this.setData({ tabindex: index });
    this.drawCicle();
    let lineCanvasArr = this.data.lineCanvasArr;
    for (let i = 0; i < lineCanvasArr.length; i++) {
      let id = lineCanvasArr[index].id.substring(10);
      if (id == '') {
        this.makeChartsData(trend, 'lineCanvas', 0);
      } else {
        this.makeChartsData(trend, 'lineCanvas' + id, parseInt(id));
      }
    }
  },
  mystats: function (paperid, unitid, learnType, free) {
    var endtimeStamp = Date.parse(new Date());
    endtimeStamp = endtimeStamp / 1000;

    var begintimeStamp = endtimeStamp - 24 * 30 * 60 * 60;
    var begintime = common.numberFormatTime(begintimeStamp, 'Y-M-D h:m:s');
    var begintimeArr = begintime.split(" ");
    begintime = begintimeArr[0] + ' 00:00:01';

    var endtime = common.numberFormatTime(endtimeStamp, 'Y-M-D h:m:s');

    api.mystats({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        from: app.globalData.from,
        begintime: begintime,
        endtime: endtime
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          this.setData({ analysis: data });
          this.setData({ stats: data.live });
          this.setData({ cicleStrtitle: '直播时长' });
          this.setData({ correct_rate: parseInt(this.data.analysis.live.totalduration / this.data.analysis.live.avgduration) }); //默认能力值，tab切换后变化
          this.setData({ cicleStr: parseInt(data.live.totalduration / 60 / 60) }); //默认能力值，tab切换后变化
          this.setData({ cicleSymbol: '小时' }); //默认能力值，tab切换后变化
          this.setData({ avgscore: parseInt(data.live.avgduration / 60 / 60) + '小时' });
          this.setData({ paiming: data.live.paiming });
          this.drawCicle();

          // 组装图表数据
          this.makeChartsData(data.live.trend, 'lineCanvas', 0);
          // this.makeChartsData(data.vod.trend, 'lineCanvas1', 1);
          // this.makeChartsData(data.answer.trend, 'lineCanvas2', 2);
          // this.makeChartsData(data.accuracy.trend, 'lineCanvas3', 3);

          var data;
          for (var i = 0; i < 4; i++) {
            if (i == 0) {
              data = {
                id: 'lineCanvas',
                canvasHidden: false
              };
            } else {
              data = {
                id: 'lineCanvas' + i,
                canvasHidden: true
              };
            }
            this.data.lineCanvasArr.push(data);
          }

          // this.data.lineCanvasIdArr.push('lineCanvas', 'lineCanvas1', 'lineCanvas2', 'lineCanvas3');
          this.setData({ lineCanvasArr: this.data.lineCanvasArr });
        } else {
          swan.showToast({
            title: data.errmsg,
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  },
  makeChartsData: function (trend, chartsId, switchTabIndex) {
    var trendCategories = [];
    var trendsData = [];
    var ptArr = [];
    var time;
    var trendCopy = [];
    if (trend.length > 8) {
      // trendCopy.push(trend[0]);
      // trendCopy.push(trend[parseInt(trend.length / 2 / 2 / 2)]);
      // trendCopy.push(trend[parseInt(trend.length / 2 / 2)]);
      // trendCopy.push(trend[parseInt(trend.length / 2)]);
      // trendCopy.push(trend[parseInt(trend.length / 2 + trend.length / 2 / 2)]);
      // trendCopy.push(trend[parseInt(trend.length / 2 + trend.length / 2 / 2 + trend.length / 2 / 2 / 2)]);
      // trendCopy.push(trend[parseInt(trend.length - 1)]);
      trendCopy = trend;
    } else {
      trendCopy = trend;
    }
    for (var i = 0; i < trendCopy.length; i++) {
      ptArr = trendCopy[i].pt.split("-");
      time = ptArr[1] + "/" + ptArr[2];
      trendCategories.push(time);
      if (switchTabIndex == 0 || switchTabIndex == 1) {
        trendsData.push(trendCopy[i].score);
      } else if (switchTabIndex == 2) {
        trendsData.push(trendCopy[i].times);
      } else if (switchTabIndex == 3) {
        trendsData.push(trendCopy[i].accuracy);
      }
      this.drawCharts(switchTabIndex, chartsId, trendCategories, this.data.switchTabArr[switchTabIndex], trendsData, this.data.clientWidth, this.data.clientHeight / 3 - 10);
    }
  },
  drawCharts: function (switchTabIndex, canvasId, categories, name, data, windowWidth, windowHeight) {
    var max = 10;
    if (switchTabIndex == 0 || switchTabIndex == 1) {
      max = 10;
    } else if (switchTabIndex == 2) {
      max = 1000;
    } else if (switchTabIndex == 3) {
      max = 100;
    }
    var lineChart = new Charts({
      canvasId: canvasId,
      type: 'column',
      animation: true,
      dataPointShape: false,
      categories: categories,
      legend: false,
      series: [{
        name: name,
        data: data,
        format: function (val) {
          return val;
        },
        color: '#388ef2'
      }],
      xAxis: {
        disableGrid: false,
        type: 'calibration'
      },
      yAxis: {
        title: '',
        format: function (val) {
          return val;
        },
        min: 0,
        max: max
      },
      width: windowWidth,
      height: windowHeight,
      dataLabel: false,
      enableScroll: true,
      extra: {
        column: {
          width: 10 //柱的宽度
        }
      }
    });
    if (switchTabIndex == 0) {
      this.setData({
        chart0: lineChart
      });
    } else if (switchTabIndex == 1) {
      this.setData({
        chart1: lineChart
      });
    } else if (switchTabIndex == 2) {
      this.setData({
        chart2: lineChart
      });
    } else if (switchTabIndex == 3) {
      this.setData({
        chart3: lineChart
      });
    }
  },
  drawCicle: function () {
    var correct_rate = this.data.correct_rate;
    var arc_l_rotate = -135 + 3.6 * correct_rate;
    var arc_r_rotate = -135 + 3.6 * (correct_rate - 50);
    if (correct_rate <= 50) {
      var animation1 = swan.createAnimation({
        transformOrigin: "50% 50%",
        duration: 600,
        timingFunction: "linear",
        delay: 600
      });
      var animation2 = swan.createAnimation({
        transformOrigin: "50% 50%",
        duration: 600,
        timingFunction: "linear",
        delay: 0
      });
      setTimeout(function () {
        animation2.rotate(-135).step();
        this.setData({
          arc_rData: animation2.export()
        });
      }.bind(this), 500);
      setTimeout(function () {
        animation1.rotate(arc_l_rotate).step();
        this.setData({
          arc_lData: animation1.export()
        });
      }.bind(this), 500);
    } else {
      var animation1 = swan.createAnimation({
        transformOrigin: "50% 50%",
        duration: 600,
        timingFunction: "linear",
        delay: 0
      });
      setTimeout(function () {
        animation1.rotate(45).step();
        this.setData({
          arc_lData: animation1.export()
        });
      }.bind(this), 500);
      var animation2 = swan.createAnimation({
        transformOrigin: "50% 50%",
        duration: 600,
        timingFunction: "linear",
        delay: 600
      });
      setTimeout(function () {
        animation2.rotate(arc_r_rotate).step();
        this.setData({
          arc_rData: animation2.export()
        });
      }.bind(this), 500);
    }
  },
  leftBtnClick: function () {
    swan.navigateBack({});
  },
  scrollCanvas: function (e) {
    console.log(e);
    var canvasLen = e.detail.scrollLeft;
    if (canvasLen > 565) {
      canvasLen = 565;
    }
    if (canvasLen <= 565) {
      this.setData({
        canvasLen: canvasLen
      });
    }
  },
  touchstart(e) {
    var index = e.target.dataset.index;
    if (index == 0) {
      if (this.data.chart0) {
        this.data.chart0.scrollStart(e);
      }
    } else if (index == 1) {
      if (this.data.chart1) {
        this.data.chart1.scrollStart(e);
      }
    } else if (index == 2) {
      if (this.data.chart2) {
        this.data.chart2.scrollStart(e);
      }
    } else if (index == 3) {
      if (this.data.chart3) {
        this.data.chart3.scrollStart(e);
      }
    }
  },
  touchmove(e) {
    var index = e.target.dataset.index;
    if (index == 0) {
      if (this.data.chart0) {
        this.data.chart0.scroll(e);
      }
    } else if (index == 1) {
      if (this.data.chart1) {
        this.data.chart1.scroll(e);
      }
    } else if (index == 2) {
      if (this.data.chart2) {
        this.data.chart2.scroll(e);
      }
    } else if (index == 3) {
      if (this.data.chart3) {
        this.data.chart3.scroll(e);
      }
    }
  },
  touchend(e) {
    var index = e.target.dataset.index;
    if (index == 0) {
      if (this.data.chart0) {
        this.data.chart0.scrollEnd(e);
      }
    } else if (index == 1) {
      if (this.data.chart1) {
        this.data.chart1.scrollEnd(e);
      }
    } else if (index == 2) {
      if (this.data.chart2) {
        this.data.chart2.scrollEnd(e);
      }
    } else if (index == 3) {
      if (this.data.chart3) {
        this.data.chart3.scrollEnd(e);
      }
    }
  }
});