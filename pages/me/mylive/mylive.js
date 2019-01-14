// pages/me/mylive/mylive.js
import api from '../../../api/api.js';
import common from '../../../utils/common.js';
//获取应用实例
var app = getApp();
var interval = null;
var courseid = null;
var categoryid = null;
var sessionid;
var uid;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    templateList: '',
    ymCategory: '',
    public_list: '',
    vip_list: '',
    centerBtnClickIndex: 0,
    recentshow: true,
    vipshow: false,
    time: '',
    countDownTime: '',
    scrollTop: 0,
    floorstatus: false,
    switchClassCategory: 0, //是否选择分类用于回调
    isScanCodeJoin: 0 //是否扫描二维码进入
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    sessionid = app.globalData.default_sessionid;
    uid = app.globalData.default_uid;
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    if (bk_userinfo != undefined && bk_userinfo != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }

    courseid = options.courseid;
    categoryid = options.categoryid;
    // courseid = 1475;
    // categoryid = 1187;
    //是否二维码进入
    if (categoryid != undefined && courseid != undefined) {
      this.setData({ isScanCodeJoin: 1 });
      swan.setStorageSync('categoryid', categoryid);
      swan.setStorageSync('courseid', courseid);
    }
    if (categoryid == undefined || categoryid == '') {
      categoryid = swan.getStorageSync('categoryid');
    }
    this.selectioncenter();
    // this.setSwitchClassCategory(wx.getStorageSync('myLiveNavIndex'));
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //切换课程两种情况1、从我的课程进入2、从选择分类进入
    // if (this.data.switchClassCategory == 1) {
    //   // this.setSwitchClassCategory(wx.getStorageSync('myLiveNavIndex'));
    //   this.selectioncenter();
    // } else {
    //   //解决切换考试数据刷新问题
    //   // var courseidSNC = wx.getStorageSync('courseid');
    //   // // console.log(courseid + "////" + courseidSNC);
    //   // if (courseid != courseidSNC && courseid != undefined) {
    //   //   courseid = courseidSNC;
    //   //   if (courseid.length > 0) {
    //   //     var categoryid = wx.getStorageSync('categoryid');
    //   //     // this.setSwitchClassCategory(wx.getStorageSync('myLiveNavIndex'));
    //   //     this.selectioncenter();
    //   //   }
    //   // }
    //   var categoryidSNC = wx.getStorageSync('categoryid');
    //   if (categoryid != categoryidSNC && categoryid != undefined) {
    //     this.selectioncenter();
    //     categoryid = wx.getStorageSync('categoryid');
    //   }
    // }
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid2 = app.globalData.default_sessionid;
    var uid2 = app.globalData.default_uid;
    if (bk_userinfo != undefined && bk_userinfo != '') {
      sessionid2 = bk_userinfo.sessionid;
      uid2 = bk_userinfo.uid;
    }
    if (sessionid != sessionid2 && uid != uid2) {
      this.selectioncenter();
      sessionid = sessionid2;
      uid = uid2;
    } else {
      var categoryidSNC = swan.getStorageSync('categoryid');
      if (categoryid != categoryidSNC && categoryid != undefined && categoryidSNC.length > 0) {
        this.selectioncenter();
        categoryid = swan.getStorageSync('categoryid');
      }
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // this.stopcountDownHandler();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // this.stopcountDownHandler();
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
  selectioncenter1: function (event) {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var uid = app.globalData.default_uid;
    if (bk_userinfo.uid != undefined || bk_userinfo.uid != '') {
      uid = bk_userinfo.uid;
    }
    api.selectioncenter({
      methods: 'POST',
      data: {
        type: 'multipleclasses',
        uid: uid
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          this.setData({ bigclass: data.list });
          swan.setStorageSync('bk_bigclass', bigclass);
          this.selectioncenter();
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
            // wx.setStorageSync('courseid', data.courselist[0].id);
            // wx.setStorageSync('coursename', data.courselist[0].title);
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
  getlivelistByCategoryid: function (index) {
    var categoryid = swan.getStorageSync('categoryid');
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      uid = bk_userinfo.uid;
    }
    api.getlivelistByCategoryid({
      methods: 'POST',
      data: {
        categoryid: categoryid,
        uid: uid
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        console.log(data);
        if (data.errcode == 0) {
          for (var i = 0; i < data.vip_list.length; i++) {
            data.vip_list[i].teacher = data.vip_list[i].teacher.replace("老师", "");
          }
          // this.setData({ public_list: data.public_list });
          this.setData({ vip_list: data.vip_list });
          // this.setData({ public_list_copy: data.public_list });
          this.setData({ vip_list_copy: data.vip_list });
          // this.makeData("public", data.public_list);
          this.makeData("vip", data.vip_list);
          // // 二维码扫描进入
          // if (courseid != undefined && categoryid != undefined && this.data.isScanCodeJoin == 1){
          //   this.setData({ isScanCodeJoin: 0 });
          //   this.scanCodeJoin(categoryid, courseid, index);
          // }
          if (index != "0") {
            this.makeDataNew(index);
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
  /**
   * 组装直播列表导航
   */
  getPublicCourseList: function () {
    api.getPublicCourseList({
      methods: 'POST',
      data: {
        from: app.globalData.from
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          var liveBigclass = [];
          liveBigclass = data.list;
          var bigclass = swan.getStorageSync('bk_bigclass');
          if (bigclass == undefined || bigclass.length < 1) {
            // this.getExamCategory(categoryid, courseid);
            this.selectioncenter1();
          } else {
            var smallclassTemp;
            var categoryidTemp;
            for (var i = 0; i < bigclass.length; i++) {
              smallclassTemp = bigclass[i].categorylist;
              for (var j = 0; j < smallclassTemp.length; j++) {
                categoryidTemp = smallclassTemp[j].id;
                for (var k = 0; k < liveBigclass.length; k++) {
                  if (categoryidTemp == liveBigclass[k].categoryid) {
                    liveBigclass[k].shorttitle = smallclassTemp[j].shorttitle;
                  }
                }
              }
            }
            //扫描二维码直接进入
            if (this.data.isScanCodeJoin == 1) {
              var sectionArr = [];
              var liveBigclassIndex = 0;
              for (var i = 0; i < liveBigclass.length; i++) {
                sectionArr.push({ name: liveBigclass[i].shorttitle, id: liveBigclass[i].categoryid });
                if (liveBigclass[i].categoryid == categoryid) {
                  liveBigclassIndex = i;
                  // wx.setNavigationBarTitle({
                  //   title: liveBigclass[i].title
                  // })
                  this.setData({
                    nav: {
                      section: sectionArr,
                      currentId: categoryid,
                      backgroundColor: 0,
                      scrollLeft: i >= 4 ? 78 * i : 0
                    }
                  });
                }
              }
              this.setData({ liveBigclass: liveBigclass });
              this.setSwitchClassCategory(liveBigclassIndex);
            } else {
              this.setData({ liveBigclass: liveBigclass });
              this.setSwitchClassCategory(swan.getStorageSync('myLiveNavIndex'));
            }
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
  makeLiveData: function () {},
  makeData: function (listType, data) {
    var todayData = {};
    var recentData = {};
    var nowTime = this.getNowTime(false);
    var startminutes;
    var endminutes;
    var ymVipCategory = [];
    var ymCategory = [];
    var length = 0;
    if (data != undefined) {
      length = data.length;
      if (data.length > 10) {
        // length = 30;
      }
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
        data[a].teachericon = "../../../image/video/head.png";
      }

      //近期直播
      var arr = common.splitToArray(data[a].liveday, "-");
      yearStr = arr[0];
      monthStr = parseInt(arr[1]);
      ymdata = {
        year: yearStr,
        month: monthStr
      };
      if (ymCategory != undefined) {
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
    if (listType == "public") {
      this.setData({ ymRecentCategory: ymCategory });
      this.setData({ public_list: data });
    } else if (listType == "vip") {
      this.setData({ ymVipCategory: ymCategory });
      this.setData({ vip_list: data });
    }

    this.countDownHandler();
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
  todayClick: function () {
    if (this.data.recentshow != true) {
      this.setData({ recentshow: true });
      this.setData({ vipshow: false });
    }
  },
  recentClick: function () {
    if (this.data.vipshow != true) {
      this.setData({ recentshow: false });
      this.setData({ vipshow: true });
    }
  },
  recentCellClick: function (event) {
    var index = event.currentTarget.dataset.index;
    // index = index == 0 ? 1 : index;
    console.log(this.data.public_list[index]);
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
        var url = '../../live/liveRoom/liveRoom?channelnumber=' + channelnumber + "&chatroomid=" + chatroomid;
        swan.navigateTo({
          url: url
        });
      }
    } else {
      if (this.data.public_list[index].state == 2 && nowTime == this.data.public_list[index].liveday) {
        this.checkcourse(courseid, videotype, channelnumber, chatroomid, index, "today");
      } else {
        this.checkcourse(courseid, videotype, channelnumber, chatroomid, index, "public");
      }
    }
  },
  vipCellClick: function (event) {
    var index = event.currentTarget.dataset.index;
    index = index == 0 ? 1 : index;
    var channelnumber = this.data.vip_list[index].channelNumber;
    var chatroomid = this.data.vip_list[index].roomid;
    var videotype = this.data.vip_list[index].type;
    var courseid = this.data.vip_list[index].courseId;
    var nowTime = this.getNowTime(false);
    if (this.data.vip_list[index].state == 2 && nowTime == this.data.vip_list[index].liveday) {
      this.checkcourse(courseid, videotype, channelnumber, chatroomid, index, "today");
    } else {
      this.checkcourse(courseid, videotype, channelnumber, chatroomid, index, "public");
    }
  },
  checkIsBuy: function (videotype, channelnumber, chatroomid, index, clicktype) {
    // var checkcourseVO = wx.getStorageSync('checkcourseVO');
    var checkcourseVO = this.data.liveCheckcourseVO;
    //已经购买直接进入，未购买检测免费时长
    console.log(videotype);
    if (videotype == 25) {
      if (checkcourseVO.m25 != 1) {
        swan.showModal({
          title: '温馨提示',
          content: '您尚未购买课程，请先购买课程。',
          confirmText: "立即购买",
          cancelText: "残忍拒绝",
          success: function (res) {
            if (res.confirm) {
              swan.navigateTo({
                url: '../../course/buyCourse/buyCourseDetail/buyCourseDetail'
              });
              return;
            } else {}
          }
        });
      } else {
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
          var url = '../../live/liveRoom/liveRoom?channelnumber=' + channelnumber + "&chatroomid=" + chatroomid;
          swan.navigateTo({
            url: url
          });
        }
      }
    } else if (videotype == 26) {
      if (checkcourseVO.m26 != 1) {
        swan.showModal({
          title: '温馨提示',
          content: '您尚未购买课程，请先购买课程。',
          confirmText: "立即购买",
          cancelText: "残忍拒绝",
          success: function (res) {
            if (res.confirm) {
              swan.navigateTo({
                url: '../../course/buyCourse/buyCourseDetail/buyCourseDetail'
              });
              return;
            } else {}
          }
        });
      } else {
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
          var url = '../../live/liveRoom/liveRoom?channelnumber=' + channelnumber + "&chatroomid=" + chatroomid;
          swan.navigateTo({
            url: url
          });
        }
      }
    }
  },
  makeTimeData: function (listType, data) {
    //有近期直播数据
    if (data.length > 0) {
      var length = data.length;
      if (data.length > 10) {
        // recentlength = 30;
      }
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
      if (listType == "public") {
        this.setData({ public_list: data });
      } else if (listType == "vip") {
        this.setData({ vip_list: data });
      }
    }
  },
  //直播倒计时
  countDownHandler: function () {
    if (!interval) {
      interval = setInterval(() => {
        if (this.data.public_list != undefined) {
          if (this.data.public_list.length > 0) {
            this.makeTimeData("public", this.data.public_list);
          }
        }
        if (this.data.vip_list != undefined) {
          if (this.data.vip_list.length > 0) {
            this.makeTimeData("vip", this.data.vip_list);
          }
        }
        //console.log('计时开始' + this.data.displayTime);
      }, 1000);
    }
  },
  stopcountDownHandler: function () {
    console.log('stop');
    if (interval) {
      clearInterval(interval);
      interval = null;
    } else {}
  },
  parseTime: function (time) {
    var dd = parseInt(time / 60 / 60 / 24);

    var hh = parseInt(time / 60 / 60 % 24);
    if (hh < 10) hh = '0' + hh;

    var mm = parseInt(time / 60 % 60);
    if (mm < 10) mm = '0' + mm;
    var ss = parseInt(time % 60);
    if (ss < 10) ss = '0' + ss;
    // var ssss = parseInt(this.data.time % 100);
    // if(ssss<10) ssss = '0'+ssss;
    // return `${mm}:${ss}:${ssss}`

    if (dd > 0) {
      return `${dd}天${hh}:${mm}:${ss}`;
    }
    if (hh > 0) {
      return `${hh}:${mm}:${ss}`;
    }
    return `${mm}:${ss}`;
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
  goTop: function (e) {
    this.setData({
      scrollTop: 0
    });
  },
  scrollclick: function (e) {
    if (e.detail.scrollTop > 500) {
      this.setData({
        floorstatus: true
      });
    } else {
      this.setData({
        floorstatus: false
      });
    }
  },
  leftBtnClick: function () {
    var url = '../../learn/classCategory/classCategory?liveListType=1';
    swan.navigateTo({
      url: url
    });
  },
  centerBtnClick: function (event) {
    var index = event.currentTarget.dataset.index;
    if (index == 0) {
      index = 1;
    } else {
      index = 0;
    }
    this.setData({ centerBtnIndex: index });
    var centerBtnClickIndex = this.data.centerBtnClickIndex;
    this.setData({
      navigation: {
        leftBtn: 0,
        // leftBtnImg: '../../image/navigation/back.png',
        leftBtnTitle: '切换',
        centerBtn: 1,
        centerBtnUpImg: '../../image/navigation/up.png',
        centerBtnDownImg: '../../image/navigation/down.png',
        centerBtnTitle: this.data.navigation.viewTitleList[centerBtnClickIndex],
        centerBtnClick: index,
        viewTitleList: this.data.navigation.viewTitleList
        // rightBtn: 0,
        // rightBtnImg: '../../image/navigation/back.png',
        // rightBtnTitle: '',
      }
    });
  },
  scanCodeJoin: function (categoryid, courseid, index) {
    var smallclass = swan.getStorageSync('bk_smallclass');
    if (smallclass == undefined || smallclass.length < 1) {
      // this.getExamCategory(categoryid, courseid);
      this.selectioncenter1();
    } else {
      this.scanCodeJoinNext(categoryid, index);
    }
  },
  scanCodeJoinNext: function (categoryid, index) {
    var smallclass = swan.getStorageSync('bk_smallclass');
    // var centerBtnClickIndex = 0;
    for (var i = 0; i < smallclass.length; i++) {
      if (smallclass[i].id == categoryid) {
        // wx.setNavigationBarTitle({
        //   title: smallclass[i].title
        // })
        console.log(12312312 + categoryid);
        swan.setStorageSync('myLiveNavIndex', i);
        // this.setSwitchClassCategory(i);
        this.setData({
          nav: {
            section: this.data.nav.section,
            currentId: categoryid,
            backgroundColor: 0,
            scrollLeft: i >= 4 ? 78 * i : 0
          }
        });
      }
    }
  },

  /**
  * 选择分类后相关设置
  */
  setSwitchClassCategory: function (index) {
    var courselist = this.data.courselist;
    var userinfo = swan.getStorageSync('bk_userinfo');
    index = index == "" ? 0 : index;
    // index = index > liveBigclass.length ? 0 : index;
    if (courselist != undefined && courselist.length > 0) {
      // wx.setNavigationBarTitle({
      //   title: liveBigclass[index].title
      // })
      var sectionArr = [];
      for (var i = 0; i < courselist.length; i++) {
        sectionArr.push({ name: courselist[i].shorttitle, id: courselist[i].id });
      }
      courseid = courselist[index].id;
      this.setData({
        nav: {
          section: sectionArr,
          currentId: courseid,
          backgroundColor: 0,
          scrollLeft: index >= 4 ? 78 * index : 0
        }
      });
      console.log(this.data.nav);
      this.getlivelistByCategoryid(index);
      this.getgongkaikelistByCategoryid(swan.getStorageSync('categoryid'));
    } else {
      // this.getExamCategory(categoryid, courseid);
      this.selectioncenter1();
    }
    // var smallclass = wx.getStorageSync('bk_smallclass');
    // index = index > smallclass.length ? 0 : index;
    // if (smallclass != undefined && smallclass.length > 0) {
    //   this.setData({ smallclass: smallclass });

    // }
    // this.checkAccount();
  },
  vipClick: function () {
    if (this.data.vipshow != true) {
      this.setData({ recentshow: false });
      this.setData({ vipshow: true });
    }
  },
  otherClick: function () {
    var url = '../../learn/classCategory/classCategory?liveListType=1';
    swan.navigateTo({
      url: url
    });
  },
  handleTap: function (event) {
    var index = event.currentTarget.dataset.index;
    if (index == swan.getStorageSync('myLiveNavIndex')) {
      return;
    }
    courseid = this.data.courselist[index].id;
    swan.setStorageSync('myLiveNavIndex', index);
    // wx.setStorageSync('categoryid', this.data.liveBigclass[index].categoryid);
    // wx.setNavigationBarTitle({
    //   title: this.data.liveBigclass[index].title
    // })
    // this.setSwitchClassCategory(index);

    this.makeDataNew(index);
  },
  makeDataNew: function (index) {
    var title = this.data.courselist[index].title;
    var titleLength = 0;
    var titleTemp;
    var endTitleLength;
    for (var i = 0; i <= index; i++) {
      titleTemp = this.data.courselist[i].title;
      if (i == index) {
        endTitleLength = titleTemp.length * 14;
      } else {
        titleLength = titleLength + titleTemp.length * 14;
      }
    }
    console.log(titleLength);
    this.setData({
      nav: {
        section: this.data.nav.section,
        currentId: courseid,
        backgroundColor: 0,
        scrollLeft: titleLength >= 375 ? titleLength - 375 : 0
      }
    });
    console.log(this.data.nav);
    var public_list_temp = [];
    var vip_list_temp = [];
    if (index == 0) {
      // courseid = wx.getStorageSync('courseid');
      this.setData({ public_list: this.data.public_list_copy });
      this.setData({ vip_list: this.data.vip_list_copy });

      this.makeData("public", this.data.public_list);
      this.makeData("vip", this.data.vip_list);
    } else {
      // wx.setStorageSync('courseid', this.data.courselist[index - 1].id);
      courseid = this.data.courselist[index].id;
      if (this.data.public_list_copy != undefined) {
        for (var i = 0; i < this.data.public_list_copy.length; i++) {
          if (this.data.public_list_copy[i].courseId == courseid) {
            public_list_temp.push(this.data.public_list_copy[i]);
          }
        }
      }
      if (this.data.vip_list_copy != undefined) {
        for (var i = 0; i < this.data.vip_list_copy.length; i++) {
          if (this.data.vip_list_copy[i].courseId == courseid) {
            vip_list_temp.push(this.data.vip_list_copy[i]);
          }
        }
      }
      this.setData({ public_list: public_list_temp });
      this.setData({ vip_list: vip_list_temp });

      this.makeData("public", this.data.public_list);
      this.makeData("vip", this.data.vip_list);
    }
  },
  // checkAccount: function () {
  //   var userinfo = wx.getStorageSync('bk_userinfo');
  //   if (userinfo == "" || userinfo == null || userinfo == undefined) {
  //     wx.showModal({
  //       title: '温馨提示',
  //       content: '您尚未登录帮考网，请先登录',
  //       confirmText: "立即登录",
  //       cancelText: "残忍拒绝",
  //       success: function (res) {
  //         if (res.confirm) {
  //           var url = '../../me/me';
  //           wx.switchTab({
  //             url: url
  //           })
  //           return;
  //         } else {
  //           return;
  //         }
  //       }
  //     })
  //     return;
  //   }
  // },
  /**
   * 检查课程信息
   */
  checkcourse: function (courseid, videotype, channelnumber, chatroomid, index, clicktype) {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = app.globalData.default_sessionid;
    var uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    api.checkcourse({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        ip: ''
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          //请求成功读取试题-v2.3
          this.setData({ liveCheckcourseVO: data });
          this.checkIsBuy(videotype, channelnumber, chatroomid, index, clicktype);
          // wx.setStorageSync('liveCheckcourseVO', data);
        } else if (data.errcode == 40036) {//请先购买课程

        } else if (data.errcode == 40052) {
          //未找到会话信息，请重新登录
          request.request_thirdauth(0);
        } else {
          //尚未绑定帮考网账号等错误
          swan.showToast({
            title: data.errmsg,
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  },
  /**
   * 检查课程信息
   */
  selectioncenter: function () {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      uid = bk_userinfo.uid;
    }
    api.selectioncenter({
      methods: 'POST',
      data: {
        type: 'liveclasses',
        uid: uid
      },
      success: res => {
        var data = res.data;
        console.log(data);
        if (data.errcode == 0) {
          //请求成功读取试题-v2.3
          var categorylist = [];
          var courselistTemp = [];
          var courselist = [];
          var courselistItem;
          courselist.push({
            id: '-1',
            title: '全部',
            shorttitle: '全部',
            cid: '',
            categoryid: '-1'
          });
          // for (var i = 0; i < data.list.length; i++) {
          //   categorylist = data.list[i].categorylist;
          //   for (var j = 0; j < categorylist.length; j++) {
          //     courselistTemp = categorylist[j].courselist;
          //     for (var k = 0; k < courselistTemp.length; k++) {
          //       courselistItem = courselistTemp[k];
          //       courselistItem.categoryid = categorylist[j].id;
          //       courselist.push(courselistTemp[k]);
          //     }
          //   }
          // }
          var bk_courselist = JSON.parse(swan.getStorageSync('bk_courselist'));
          for (var i = 0; i < bk_courselist.length; i++) {
            courselist.push({
              shorttitle: bk_courselist[i].shorttitle,
              id: bk_courselist[i].id,
              title: bk_courselist[i].title,
              cid: '',
              categoryid: bk_courselist[i].categoryid
            });
          }
          this.setData({ courselist: courselist });
          this.setSwitchClassCategory(swan.getStorageSync('myLiveNavIndex'));
        } else {
          //尚未绑定帮考网账号等错误
          swan.showToast({
            title: data.errmsg,
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  },
  //根据考试ID读取直播公开课
  getgongkaikelistByCategoryid: function (categoryid) {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = app.globalData.default_sessionid;
    var uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    api.getgongkaikelistByCategoryid({
      methods: 'POST',
      data: {
        categoryid: categoryid,
        sessionid: sessionid,
        uid: uid
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        console.log(data);
        if (data.errcode == 0) {
          for (var i = 0; i < data.gkklist.length; i++) {
            data.gkklist[i].teacher = data.gkklist[i].teacher.replace("老师", "");
          }
          this.setData({ public_list: data.gkklist });
          this.setData({ public_list_copy: data.gkklist });
          this.makeData("public", data.gkklist);
        } else {
          swan.showToast({
            title: data.errmsg,
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  }
});