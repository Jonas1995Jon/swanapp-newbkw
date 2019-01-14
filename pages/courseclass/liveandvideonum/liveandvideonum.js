import api from '../../../api/api.js';
import request from '../../../api/request.js';
import common from '../../../utils/common.js';
var app = getApp();

var bk_userinfo;
var sessionid;
var uid;
var courseid;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navigation: {
      leftBtn: 1,
      leftBtnImg: '../../../image/navigation/back.png',
      centerBtn: 1,
      centerBtnUpImg: '../../../image/navigation/up.png',
      centerBtnDownImg: '../../../image/navigation/down.png',
      centerBtnTitle: '学习',
      centerBtnClick: 0
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var brushtype = options.brushtype;
    this.setData({ brushtype: brushtype });
    bk_userinfo = swan.getStorageSync('bk_userinfo');
    sessionid = app.globalData.default_sessionid;
    uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    courseid = swan.getStorageSync('courseid');
    swan.setNavigationBarTitle({
      title: brushtype == 1 ? "直播时长" : "视频时长"
    });
    this.getvideowatchcount();
    this.getrecentviewingrecord();
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
  getvideowatchcount: function () {
    api.getvideowatchcount({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        type: this.data.brushtype == 1 ? "live" : "vod"
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          if (data.total_timelength > 0) {
            data.total_timelength = this.parseTime(data.total_timelength);
          } else {
            data.total_timelength = '0分0秒';
          }
          if (data.watch_video_timelength > 0) {
            data.watch_video_timelength = this.parseTime(data.watch_video_timelength);
          } else {
            data.watch_video_timelength = '0分0秒';
          }
          this.setData({ brush: data });
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
  //最近观看过的视频记录列表
  getrecentviewingrecord: function () {
    api.getrecentviewingrecord({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        type: this.data.brushtype == 1 ? "live" : "vod",
        pageindex: 1,
        pagesize: 100
      },
      success: res => {
        var data = res.data;
        console.log(data);
        if (data.errcode == 0) {
          if (data.list.length > 0) {
            var watchcopy = data.list;
            for (var i = 0; i < data.list.length; i++) {
              data.list[i].addtime = data.list[i].addtime.replace('.0', '');
              if (data.list[i].duration > 59) {
                data.list[i].duration = this.parseTime(data.list[i].duration);
              } else {
                data.list[i].duration = data.list[i].duration + '秒';
              }
              // if (this.data.brushtype == 1) {
              //   this.getvideocodebychannelnumber(data.list[i].channelnumber);
              // } else {
              //   this.knowpointGetDetail(data.list[i].channelnumber);
              // }
            }
            this.setData({
              watchlist: data.list,
              watchcopy: watchcopy
            });
          }
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
  // getVideoLearningRecords: function () {
  //   api.getVideoLearningRecords({
  //     methods: 'POST',
  //     data: {
  //       sessionid: sessionid,
  //       uid: uid,
  //       courseid: courseid,
  //       action: this.data.brushtype == 1 ? "watchlive" : "watchvod",
  //     },
  //     success: (res) => {
  //       var data = res.data;
  //       console.log(data)
  //       if (data.errcode == 0) {
  //         if(data.list.length > 0){
  //           var watchcopy = data.list;
  //           for(var i = 0;i < data.list.length; i++){
  //             data.list[i].addtime = data.list[i].addtime.replace('.0','');
  //             if(data.list[i].duration > 59){
  //               data.list[i].duration = this.parseTime(data.list[i].duration);
  //             }else{
  //               data.list[i].duration = data.list[i].duration + '秒';
  //             }
  //             if(this.data.brushtype == 1){
  //               this.getvideocodebychannelnumber(data.list[i].channelnumber);
  //             }else {
  //               this.knowpointGetDetail(data.list[i].channelnumber);
  //             }
  //           }
  //           this.setData({
  //             watchlist: data.list,
  //             watchcopy: watchcopy
  //           })
  //         }
  //       } else {
  //         swan.showToast({
  //           title: data.errmsg
  //         });
  //       }
  //     }
  //   })
  // },
  leftBtnClick: function () {
    swan.navigateBack({});
  },
  parseTime: function (time) {
    var dd = parseInt(time / 60 / 60 / 24);
    var hh = parseInt(time / 60 / 60 % 24);
    var mm = parseInt(time / 60 % 60);
    var ss = parseInt(time % 60);
    if (dd > 0) {
      return `${dd}天${hh}时${mm}分${ss}秒`;
    }
    if (hh > 0) {
      return `${hh}时${mm}分${ss}秒`;
    }
    return `${mm}分${ss}秒`;
  },
  // getvideocodebychannelnumber: function (channelnumber){
  //   api.getvideocodebychannelnumber({
  //     methods:'POST',
  //     data: {
  //       channelnumber: channelnumber,
  //       videosource: app.globalData.videosource,
  //       definition: app.globalData.definition,
  //       sessionid: sessionid,
  //       uid: uid
  //     },
  //     success: (res) => {
  //       var data = res.data;
  //       console.log(data)
  //       if(data.errcode == 0){
  //         var watchlist = this.data.watchlist;
  //         for(var i = 0;i < watchlist.length; i++){
  //           if(watchlist[i].channelnumber == channelnumber){
  //             watchlist[i].cover = data.cover;
  //           }
  //         }
  //         this.setData({
  //           watchlist: watchlist,
  //           watchdatil: data
  //         })
  //       }
  //     }
  //   })
  // },
  // knowpointGetDetail: function (kpid) {
  //   api.knowpointGetDetail({
  //     methods: 'POST',
  //     data: {
  //       kpid: kpid,
  //       videosource: app.globalData.videosource,
  //       definition: app.globalData.definition,
  //       sessionid: sessionid,
  //       uid: uid,
  //       courseid: courseid,
  //     },
  //     success: (res) => {
  //       var data = res.data;
  //       if (data.errcode == 0) {
  //         console.log(data)
  //         var watchlist = this.data.watchlist;
  //         for (var i = 0; i < watchlist.length; i++) {
  //           if (watchlist[i].channelnumber == kpid) {
  //             watchlist[i].cover = data.cover;
  //           }
  //         }
  //         this.setData({
  //           watchlist: watchlist,
  //         })
  //       }
  //     }
  //   })
  // },
  playClick: function (even) {
    var index = even.currentTarget.dataset.index;
    var channelnumber = this.data.watchlist[index].channelnumber;
    var brushtype = this.data.brushtype;
    var time = this.data.watchcopy[index].duration;
    var module = this.data.watchcopy[index].module;
    module = module.replace('m', '');
    swan.navigateTo({
      url: 'playLiveOrVideo?channelnumber=' + channelnumber + '&brushtype=' + brushtype + '&time=' + time + '&module=' + module
    });
  }
});