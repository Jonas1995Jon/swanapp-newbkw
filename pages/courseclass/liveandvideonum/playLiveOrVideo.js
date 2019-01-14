// video.js
import api from '../../../api/api.js';
import request from '../../../api/request.js';
import common from '../../../utils/common.js';
//获取应用实例
var app = getApp();

var sessionid;
var uid;
var courseid;

var logsTimer = null;
var onlineTimer = null;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isShowCoverView: true
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    courseid = swan.getStorageSync('courseid');
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    sessionid = app.globalData.default_sessionid;
    uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    var channelnumber = options.channelnumber;
    this.setData({
      channelnumber: channelnumber
    });
    var brushtype = options.brushtype;
    var module = options.module;
    this.setData({
      initial_time: parseInt(options.time),
      module: parseInt(module),
      brushtype: brushtype
    });
    if (brushtype == 1) {
      this.getvideocodebychannelnumber(channelnumber);
    } else {
      this.knowpointGetDetail(channelnumber);
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
  onHide: function () {
    var that = this;
    if (that.data.videoContext.action != undefined) {
      that.data.videoContext.pause();
    }
    that.logsTimerStopHandler();
    that.onlineTimerStopHandler();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.logsTimerStopHandler();
    this.onlineTimerStopHandler();
  },

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
  getvideocodebychannelnumber: function (channelnumber) {
    api.getvideocodebychannelnumber({
      methods: 'POST',
      data: {
        channelnumber: channelnumber,
        videosource: app.globalData.videosource,
        definition: app.globalData.definition,
        sessionid: sessionid,
        uid: uid
      },
      success: res => {
        var data = res.data;
        // console.log(data)
        if (data.errcode == 0) {
          this.setData({
            videoUrl: data.videocode,
            cover: data.cover,
            title: data.title
          });
        }
      }
    });
  },
  knowpointGetDetail: function (kpid) {
    api.knowpointGetDetail({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        kpid: kpid,
        videosource: app.globalData.videosource,
        screenwidth: '640',
        screenheight: '1136',
        definition: app.globalData.definition,
        version: '1.0'
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        console.log(data);
        if (data.errcode == 0) {
          this.setData({
            videoUrl: data.videocode,
            cover: data.cover,
            title: data.name
          });
        } else if (data.errcode == 40002) {
          swan.showModal({
            title: '温馨提示',
            content: data.errmsg,
            confirmText: "立即购买",
            cancelText: "残忍拒绝",
            success: function (res) {
              if (res.confirm) {
                swan.navigateTo({
                  url: '../../course/buyCourse/buyCourseDetail/buyCourseDetail'
                });
                return;
              } else {
                return;
              }
            }
          });
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

  //视频错误
  listenerVideo: function (event) {
    this.logsTimerStopHandler();
    this.onlineTimerStopHandler();
    console.log('listenerVideo' + event);
  },
  // 开始播发
  startPlay: function (event) {
    this.setData({
      isShowCoverView: false
    });
    console.log('startPlay' + event);
    this.logsTimerHandler(); //视频日志记录
    this.onlineTimerHandler();
  },
  // 暂停播放
  pausePlay: function (event) {
    this.logsTimerStopHandler();
    this.onlineTimerStopHandler();
    console.log('pausePlay' + event);
  },
  // 播放至末尾
  endPlay: function (event) {
    this.logsTimerStopHandler();
    this.onlineTimerStopHandler();
    console.log('endPlay' + event);
  },
  //刷题记录日志定时器
  logsTimerHandler: function () {
    var nowDate = new Date();
    var addtime = common.formatTime(nowDate);
    var model;
    var os;
    var resolution;
    var that = this;
    swan.getSystemInfo({
      success: function (res) {
        model = res.model;
        os = res.system;
        resolution = res.windowWidth + '*' + res.windowHeight;
      }
    });
    var pageid = common.randomString(32);
    if (!logsTimer) {
      logsTimer = setInterval(() => {
        var data = {
          action: that.data.brushtype == 1 ? 'watchlive' : 'watchvod',
          channelnumber: that.data.channelnumber,
          module: that.data.module,
          courseid: courseid,
          // unitid: this.data.unitid,
          addtime: addtime,
          sessionid: sessionid,
          userid: uid,
          from: getApp().globalData.from,
          duration: 10 + that.data.initial_time,
          pageid: pageid,
          ip: '',
          os: os,
          browser: '',
          resolution: resolution,
          appname: getApp().globalData.appname,
          appversion: getApp().globalData.appversion,
          appbuild: getApp().globalData.appbuild,
          mobiletype: model
          //防止错误上传日志
        };if (that.data.channelnumber == undefined) {
          return;
        }
        request.request_collectLog(data);
      }, 10000);
    }
  },
  //扣除学时、判断是否同时在线学习定时器
  onlineTimerHandler: function () {
    if (!onlineTimer) {
      onlineTimer = setInterval(() => {
        this.setremainder();
        this.setonline();
      }, 60000);
    }
  },
  //扣除学时
  setremainder: function () {
    api.setremainder({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        type: 14,
        times: 60,
        market: app.globalData.market
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          //不处理
        } else if (data.errcode == -1) {
          //60分钟免费试用时间已经用完,无法继续观看！
          this.onlineTimerStopHandler(); //停止扣学时
          swan.showModal({
            title: '温馨提示',
            content: data.errmsg,
            confirmText: "立即购买",
            cancelText: "残忍拒绝",
            success: function (res) {
              if (res.confirm) {
                swan.navigateTo({
                  url: '../../buyCourseNew'
                });
              } else {
                var pages = getCurrentPages();
                var num = pages.length;
                swan.navigateBack({
                  delta: num
                });
              }
            }
          });
        } else if (data.errcode == -2) {
          //您的学时已经用完，无法继续学习，请联系学习顾问加时！
          this.onlineTimerStopHandler(); //停止扣学时
          swan.showModal({
            title: '温馨提示',
            content: data.errmsg,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                var pages = getCurrentPages();
                var num = pages.length;
                swan.navigateBack({
                  delta: num
                });
              }
            }
          });
        }
      }
    });
  },
  //判断是否同时在线学习
  setonline: function () {
    api.setonline({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        type: 14
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          //
        } else if (data.errcode == 40057) {
          //您的账号在其他地方登录学习，您将被迫退出
          this.onlineTimerStopHandler(); //停止扣学时
          swan.showModal({
            title: '温馨提示',
            content: data.errmsg,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                var pages = getCurrentPages();
                var num = pages.length;
                swan.navigateBack({
                  delta: num
                });
              }
            }
          });
        }
      }
    });
  },
  logsTimerStopHandler: function () {
    console.log('logsTimer stop');
    if (logsTimer) {
      clearInterval(logsTimer);
      logsTimer = null;
    }
  },
  onlineTimerStopHandler: function () {
    console.log('onlineTimer stop');
    if (onlineTimer) {
      clearInterval(onlineTimer);
      onlineTimer = null;
    }
  }
});