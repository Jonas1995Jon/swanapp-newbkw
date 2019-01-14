// pages/courseclass/courseclass.js
import api from '../../api/api.js';
import request from '../../api/request.js';
import common from '../../utils/common.js';

//获取应用实例
var app = getApp();
var interval = null;
var bk_userinfo;
var sessionid;
var uid;
var courseid;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollTop: 0,
    public_list: [],
    banxing_tiku: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sharecourseid = options.sharecourseid;
    var sharecategoryid = options.sharecategoryid;
    var sharecoursename = options.sharecoursename;
    var sharecategoryname = options.sharecategoryname;
    console.log(sharecourseid + sharecategoryid + sharecoursename + sharecategoryname);
    if (sharecourseid != undefined && sharecategoryid != undefined && sharecoursename != undefined && sharecategoryname != undefined) {
      swan.setStorageSync('courseid', sharecourseid);
      swan.setStorageSync('categoryid', sharecategoryid);
      swan.setStorageSync('coursename', sharecoursename);
      swan.setStorageSync('categoryname', sharecategoryname);
      this.getCourseByCategory(sharecategoryid);
    } else {
      this.setSwitchClassCategory(swan.getStorageSync('navIndex') > 0 ? swan.getStorageSync('navIndex') : 0);
    }
    // this.getlivelistByCategoryid();
    // this.checksupplement();
    courseid = swan.getStorageSync('courseid');
    this.getclasspagedata();
    this.checkcourse_v9();
  },

  /** 
     * 滑动切换tab 
     */
  bindChange: function (e) {
    var that = this;
    that.setData({
      nav: {
        winWidth: res.windowWidth,
        winHeight: res.windowHeight,
        currentTab: e.detail.current
      }
    });
  },
  /** 
   * 点击tab切换 
   */
  swichNav: function (e) {
    var that = this;
    if (this.data.nav.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        nav: {
          winWidth: res.windowWidth,
          winHeight: res.windowHeight,
          currentTab: e.target.dataset.current
        }
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var checkcourseVO = swan.getStorageSync('checkcourseVO');
    if (checkcourseVO != '' && checkcourseVO != undefined) {
      this.setData({
        recentexamtime: checkcourseVO.recentexamtime
      });
    }
    // else{
    //   wx.navigateTo({
    //     url: '../learn/classCategory/classCategory',
    //   })
    // }
    //切换课程两种情况1、从我的课程进入2、从选择分类进入
    if (this.data.switchClassCategory == 1) {
      this.setSwitchClassCategory(swan.getStorageSync('navIndex') > 0 ? swan.getStorageSync('navIndex') : 0);
      this.getclasspagedata();
      this.checkcourse_v9();
    } else {
      //解决切换考试数据刷新问题
      var courseidSNC = swan.getStorageSync('courseid');
      // console.log(courseid + "////" + courseidSNC);
      if (courseid != courseidSNC && courseid != undefined) {
        courseid = courseidSNC;
        if (courseid.length > 0) {
          var categoryid = swan.getStorageSync('categoryid');
          this.setSwitchClassCategory(swan.getStorageSync('navIndex') > 0 ? swan.getStorageSync('navIndex') : 0);;
          this.getclasspagedata();
          this.checkcourse_v9();
        }
      }
    }
    if (this.data.public_list != undefined) {
      this.countDownHandler();
    }
    var bk_user = swan.getStorageSync('bk_userinfo');
    if (bk_userinfo.sessionid != bk_user.sessionid) {
      this.getclasspagedata();
      this.checkcourse_v9();
      bk_userinfo == swan.getStorageSync('bk_userinfo');
    }
    // this.getShuaticountLivecountVodcount();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.stopcountDownHandler();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.stopcountDownHandler();
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
  /**
  * 选择分类后相关设置
  */
  setSwitchClassCategory: function (index) {
    var courselist = JSON.parse(swan.getStorageSync('bk_courselist'));
    index = index > courselist.length ? 0 : index;
    this.setData({ courselist: courselist });
    if (courselist != undefined && courselist.length > 0) {
      var sectionArr = [];
      for (var i = 0; i < courselist.length; i++) {
        sectionArr.push({ name: courselist[i].shorttitle, id: courselist[i].id });
      }
      var courseid = courselist[index].id;
      this.setData({
        nav: {
          section: sectionArr,
          currentId: courseid.length > 0 ? courseid : courselist[0].id,
          backgroundColor: 1,
          scrollLeft: index >= 4 ? 78 * index : 0
        }
      });
      this.getclasspagedata();
      if (this.data.banxing_tiku != undefined && this.data.banxing_tiku != 0) {
        this.checksupplement();
        this.getShuaticountLivecountVodcount();
      }
    }
  },
  getShuaticountLivecountVodcount: function () {
    if (courseid == undefined) {
      courseid = swan.getStorageSync('courseid');
    }
    bk_userinfo = swan.getStorageSync('bk_userinfo');
    sessionid = app.globalData.default_sessionid;
    uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    api.getShuaticountLivecountVodcount({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        console.log(sessionid, uid);
        if (data.errcode == 0) {
          data.shuaticount = data.shuaticount + '道题';
          data.live_timelength = this.parseTime(data.live_timelength);
          data.vod_timelength = this.parseTime(data.vod_timelength);
          this.setData({ topCountList: data });
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
  getclasspagedata: function () {
    var categoryid = swan.getStorageSync('categoryid');
    api.getclasspagedata({
      methods: 'POST',
      data: {
        categoryid: categoryid
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        console.log(data);
        if (data.errcode == 0) {
          this.setData({
            pagelist: data.pagelist,
            havegkk: data.havegkk
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
  //获取考试类别
  getCourseByCategory: function (id) {
    api.getCourseByCategory({
      methods: 'POST',
      data: {
        categoryid: id
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          var courselist = data.courselist;
          var smallclass;
          for (var i = 0; i < courselist.length; i++) {
            courselist[i].title = decodeURI(courselist[i].title);
            courselist[i].shorttitle = decodeURI(courselist[i].shorttitle);
          }
          var courselist = JSON.stringify(courselist);
          swan.setStorageSync('bk_courselist', courselist);
          if (courselist != undefined && courselist.length > 0) {
            swan.setStorageSync('centerBtnClickIndex', 0);
            swan.setStorageSync('courseid', data.courselist[0].id);
            swan.setStorageSync('coursename', data.courselist[0].title);
            this.setSwitchClassCategory(swan.getStorageSync('navIndex') > 0 ? swan.getStorageSync('navIndex') : 0);
          } else {
            var url = '../me/me';
            swan.switchTab({
              url: url
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
  handleTap: function (event) {
    var index = event.currentTarget.dataset.index;
    if (index == swan.getStorageSync('navIndex')) {
      return;
    }
    var that = this;
    swan.setStorageSync('navIndex', index);
    courseid = this.data.courselist[index].id;
    swan.setStorageSync('courseid', this.data.courselist[index].id);
    swan.setStorageSync('coursename', this.data.courselist[index].title);
    that.setSwitchClassCategory(index);
  },
  brushNumTap: function () {
    swan.navigateTo({
      url: '../find/learningRecord/learningRecord?brushNum=1'
    });
  },
  liveNumTap: function () {
    swan.navigateTo({
      url: 'liveandvideonum/liveandvideonum?brushtype=1'
    });
  },
  videoNumTap: function () {
    swan.navigateTo({
      url: 'liveandvideonum/liveandvideonum?brushtype=2'
    });
  },
  situationClick: function (res) {
    var url = '../find/learningAnalysis/learningAnalysis';
    swan.navigateTo({
      url: url
    });
  },
  videolearnTap: function (res) {
    swan.navigateTo({
      url: '../learn/liveVideoNum/liveVideoNum'
    });
  },
  livelearnTap: function (res) {
    swan.navigateTo({
      url: '../livelist/livePublicList'
    });
  },
  brushlearnTap: function (res) {
    swan.navigateTo({
      url: '../learn/brushNum/brushNum'
    });
  },
  getlivelistByCategoryid: function (res) {
    var categoryid = swan.getStorageSync('categoryid');
    api.getlivelistByCategoryid({
      methods: 'POST',
      data: {
        categoryid: categoryid
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          this.setData({ public_list: data.recent_list });
          this.makeData(data.recent_list);
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
  makeData: function (data) {
    var todayData = {};
    var publicData = {};
    var nowTime = this.getNowTime(false);
    var startminutes;
    var endminutes;
    var ymVipCategory = [];
    var ymCategory = [];
    var length = data.length;
    if (data.length > 10) {
      // length = 30;
    }
    var startTime;
    var endTime;
    var yearStr;
    var monthStr;
    var ymdata = {};
    var todayData = {};
    var nowTime = this.getNowTime(false);
    for (var a = 0; a < length; a++) {
      startTime = this.strToDate(data[a].startTime.replace(/-/g, '/'));
      endTime = this.strToDate(data[a].endTime.replace(/-/g, '/'));
      if (data[a].teacher == "" || data[a].teacher == null) {
        data[a].teacher = "帮考老师";
      }
      if (data[a].teachericon == "" || data[a].teachericon == null) {
        data[a].teachericon = "../../image/video/head.png";
      }
      //近期直播
      var arr = common.splitToArray(data[a].liveday, "-");
      yearStr = arr[0];
      monthStr = parseInt(arr[1]);
      ymdata = {
        year: yearStr,
        month: monthStr
      };
      if (ymCategory.length > 0) {
        var isExistence = 0;
        for (var b = 0; b < ymCategory.length; b++) {
          if (yearStr + "" + monthStr == ymCategory[b].year + ymCategory[b].month) {
            isExistence = 1;
          }
        }
        if (isExistence == 0) {
          ymCategory.push(ymdata);
        }
      } else {
        ymCategory.push(ymdata);
      }
      startminutes = startTime.getMinutes(); //定义个变量保存秒数
      endminutes = endTime.getMinutes(); //定义个变量保存秒数
      if (startminutes < 10) {
        startminutes = "0" + startminutes;
      } //秒数前加个0   
      if (endminutes < 10) {
        endminutes = "0" + endminutes;
      }
      data[a].year = startTime.getFullYear();
      data[a].month = parseInt(startTime.getMonth()) + 1;
      data[a].day = startTime.getDate();
      data[a].startTimeHour = startTime.getHours() + ":" + startminutes;
      data[a].endTimeHour = endTime.getHours() + ":" + endminutes;

      var timestamp = Date.parse(new Date());
      timestamp = timestamp / 1000;
      var timestamp2 = Date.parse(startTime);
      timestamp2 = timestamp2 / 1000;

      if (timestamp2 >= timestamp) {
        data[a].countDownTime = this.parseTime(timestamp2 - timestamp);
      }
    }
    this.setData({ ymPublicCategory: ymCategory });
    this.setData({ public_list: data });
    this.countDownHandler();
  },
  //直播倒计时
  countDownHandler: function () {
    if (!interval) {
      interval = setInterval(() => {
        if (this.data.public_list.length > 0) {
          this.makeTimeData(this.data.public_list);
        }
      }, 1000);
    }
  },
  makeTimeData: function (data) {
    if (data.length > 0) {
      var length = data.length;
      for (var i = 0; i < length; i++) {
        var timestamp = Date.parse(new Date());
        timestamp = timestamp / 1000;
        var timestamp2 = Date.parse(this.strToDate(data[i].startTime.replace(/-/g, '/')));
        timestamp2 = timestamp2 / 1000;
        var timestamp3 = Date.parse(this.strToDate(data[i].endTime.replace(/-/g, '/')));
        timestamp3 = timestamp3 / 1000;
        // console.log(timestamp3 + "|" + timestamp2 + "|" + timestamp);
        if (timestamp2 >= timestamp) {
          data[i].countDownTime = this.parseTime(timestamp2 - timestamp);
        }
        // console.log(timestamp2 - timestamp + "/" + timestamp3 - timestamp);
        if (timestamp2 - timestamp <= 0 && timestamp3 - timestamp >= 0) {
          data[i].state = '1';
        } else if (timestamp2 - timestamp <= 0 && timestamp3 - timestamp < 0) {
          data[i].state = '2';
        } else if (timestamp3 - timestamp > 0 && timestamp3 - timestamp <= 60 * 60 * 24) {
          data[i].state = '3';
        } else {
          data[i].state = '0';
        }
      }
      this.setData({ public_list: data });
    }
  },
  getNowTime: function (isHMS) {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    if (month < 10) {
      month = '0' + month;
    };
    if (day < 10) {
      day = '0' + day;
    };
    var formatDate;
    if (isHMS == true) {
      //  如果需要时分秒，就放开
      var h = now.getHours();
      var m = now.getMinutes();
      var s = now.getSeconds();
      if (h < 10) {
        h = '0' + h;
      };
      if (m < 10) {
        m = '0' + m;
      };
      if (s < 10) {
        s = '0' + s;
      };
      formatDate = year + '-' + month + '-' + day + ' ' + h + ':' + m + ':' + s;
    } else {
      formatDate = year + '-' + month + '-' + day;
    }
    return formatDate;
  },
  /**
   * 字符串转换为时间
   * @param  {String} src 字符串
   */
  strToDate: function (dateObj) {
    dateObj = dateObj.replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '').replace(/(-)/g, '/');
    dateObj = dateObj.slice(0, dateObj.indexOf("."));
    return new Date(dateObj);
  },
  stopcountDownHandler: function () {
    console.log('stop');
    if (interval) {
      clearInterval(interval);
      interval = null;
    } else {}
  },
  publicCellClick: function (event) {
    var index = event.currentTarget.dataset.index;
    var channelnumber = this.data.public_list[index].channelNumber;
    var chatroomid = this.data.public_list[index].roomid;
    var videotype = this.data.public_list[index].type;
    var courseid = this.data.public_list[index].courseId;
    var nowTime = this.getNowTime(false);
    if (courseid == 0) {
      var clicktype;
      if (this.data.public_list[index].state == 2 && nowTime == this.data.public_list[index].liveday) {
        clicktype = "today";
        // this.checkIsBuy(videotype, channelnumber, chatroomid, index, "today");
      } else {
        clicktype = "public";
        // this.checkIsBuy(videotype, channelnumber, chatroomid, index, "public");
      }
      if (clicktype == "today" && this.data.public_list[0].state == 2) {
        swan.showModal({
          title: '温馨提示',
          content: '直播回放正在火速剪切上传中，敬请期待。',
          confirmText: "确定",
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              return;
            } else {}
          }
        });
      } else {
        var url = '../live/liveRoom/liveRoom?channelnumber=' + channelnumber + "&chatroomid=" + chatroomid;
        // console.log(url);
        swan.navigateTo({
          url: url
        });
      }
    } else {
      if (this.data.public_list[index].state == 2 && nowTime == this.data.public_list[index].liveday) {
        this.getvideocodebychannelnumber(courseid, videotype, channelnumber, chatroomid, index, "today");
      } else {
        this.getvideocodebychannelnumber(courseid, videotype, channelnumber, chatroomid, index, "public");
      }
    }
  },
  /**
  * 检查课程信息
  */
  getvideocodebychannelnumber: function (courseid, videotype, channelnumber, chatroomid, index, clicktype) {
    var checkBind = this.checkUserInfo();
    if (checkBind == false) {
      return;
    }
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = app.globalData.default_sessionid;
    var uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    api.getvideocodebychannelnumber({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        channelnumber: channelnumber,
        videosource: app.globalData.videosource,
        definition: app.globalData.definition
      },
      success: res => {
        var data = res.data;
        console.log(data);
        if (data.errcode == 0) {
          //请求成功读取试题-v2.3
          this.checkIsBuy(videotype, channelnumber, chatroomid, index, clicktype);
        } else if (data.errcode == 40003) {
          //请先购买课程
          swan.showModal({
            title: '温馨提示',
            content: data.errmsg,
            confirmText: "立即购买",
            cancelText: "残忍拒绝",
            success: function (res) {
              if (res.confirm) {
                swan.navigateTo({
                  url: '../course/buyCourse/buyCourseDetail/buyCourseDetail'
                });
                return;
              } else {}
            }
          });
        } else if (data.errcode == 40052) {
          //未找到会话信息，请重新登录
          request_thirdauth(0);
        } else {
          //尚未绑定帮考网账号等错误
          swan.showModal({
            title: '温馨提示',
            content: data.errmsg,
            confirmText: "确定",
            showCancel: false,
            success: function (res) {}
          });
        }
      }
    });
  },
  checkUserInfo: function () {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    if (bk_userinfo == '' || bk_userinfo == null) {
      swan.showModal({
        title: '温馨提示',
        content: '您尚未登录帮考网，请先登录！',
        confirmText: "立即登录",
        cancelText: "残忍拒绝",
        success: function (res) {
          if (res.confirm) {
            var bindurl = '../me/bind/bind';
            swan.navigateTo({
              url: bindurl
            });
          } else {
            return;
          }
        }
      });
      return false;
    } else {
      return true;
    }
  },
  /** 
  * 补签协议-查询是否可以补签协议
  */
  checksupplement: function () {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = app.globalData.default_sessionid;
    var uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    var courseid = swan.getStorageSync('courseid');
    api.checksupplement({
      methods: 'POST',
      data: {
        courseid: courseid,
        sessionid: sessionid,
        uid: uid,
        coursetype: app.globalData.learnType[13][0].type
      },
      success: res => {
        var data = res.data;
        //不做任何处理
        if (data.errcode == 0) {
          var url = '../agreement/agreement?agreementList=' + JSON.stringify(data);
          swan.navigateTo({
            url: url
          });
        }
      },
      //这个接口请求iOS真机上会报错，待解决官网解释是服务器返回不是utf8编码问题
      fail: res => {
        console.log('出错');
      }
    });
  },
  // 监听屏幕滚动 判断上下滚动  
  onPageScroll: function (ev) {
    var _this = this;
    //当滚动的top值最大或者最小时，为什么要做这一步是由于在手机实测小程序的时候会发生滚动条回弹，所以为了解决回弹，设置默认最大最小值   
    if (ev.scrollTop <= 0) {
      ev.scrollTop = 0;
    } else if (ev.scrollTop > swan.getSystemInfoSync().windowHeight) {
      ev.scrollTop = swan.getSystemInfoSync().windowHeight;
    }
    //判断浏览器滚动条上下滚动   
    // if (ev.scrollTop > this.data.scrollTop || ev.scrollTop == wx.getSystemInfoSync().windowHeight) {
    //   console.log('向下滚动');
    // } else {
    //   console.log('向上滚动');
    // }
    //给scrollTop重新赋值    
    setTimeout(function () {
      _this.setData({
        scrollTop: ev.scrollTop
      });
    }, 0);
  },
  gopubliccourse: function (res) {
    swan.navigateTo({
      url: '../auditions/auditions?currentindex=1'
    });
  },
  buycourse: function (res) {
    swan.navigateTo({
      url: '../course/buyCourse/buyCourseDetail/buyCourseDetail'
    });
  },
  checkcourse_v9: function () {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = app.globalData.default_sessionid;
    var uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    var courseid = swan.getStorageSync('courseid');
    var that = this;
    api.checkcourse({
      method: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid
      },
      success: function (res) {
        var data = res.data;
        console.log(data.banxing_tiku);
        if (data.errcode == 0) {
          that.setData({
            banxing_tiku: data.banxing_tiku
          });
          if (data.banxing_tiku != 0) {
            that.getlivelistByCategoryid();
            that.checksupplement();
            that.getShuaticountLivecountVodcount();
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
  checkIsBuy: function (videotype, channelnumber, chatroomid, index, clicktype) {
    // var checkcourseVO = wx.getStorageSync('checkcourseVO');
    // var checkcourseVO = this.data.liveCheckcourseVO;
    //已经购买直接进入，未购买检测免费时长

    if (videotype == 25) {
      if (clicktype == "today" && this.data.public_list[0].state == 2) {
        swan.showModal({
          title: '温馨提示',
          content: '直播回放正在火速剪切上传中，敬请期待。',
          confirmText: "确定",
          showCancel: false,
          success: function (res) {
            if (res.confirm) {

              return;
            } else {}
          }
        });
      } else {
        var url = '../live/liveRoom/liveRoom?channelnumber=' + channelnumber + "&chatroomid=" + chatroomid;
        swan.navigateTo({
          url: url
        });
      }
    } else if (videotype == 26) {

      if (clicktype == "today" && this.data.public_list[0].state == 2) {
        swan.showModal({
          title: '温馨提示',
          content: '今日直播回放正在火速剪切上传中，敬请期待。',
          confirmText: "确定",
          showCancel: false,
          success: function (res) {
            if (res.confirm) {

              return;
            } else {}
          }
        });
      } else {
        var url = '../live/liveRoom/liveRoom?channelnumber=' + channelnumber + "&chatroomid=" + chatroomid;
        swan.navigateTo({
          url: url
        });
      }
    }
  }
});