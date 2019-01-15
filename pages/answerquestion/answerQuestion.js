// pages/answerquestion/answerQuestion.js
import api from '../../api/api.js';
import request from '../../api/request.js';
import common from '../../utils/common.js';

//获取应用实例
var app = getApp();
var bk_userinfo;
var sessionid;
var uid;
var categoryid;
var courseid;
Page({

  /**
   * 页面的初始数据
   */
  data: {},

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
    this.setData({ sessionid, sessionid });
    this.setData({ uid, uid });

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
    }
    this.getQuestionListGroupbyCourse();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    bk_userinfo = swan.getStorageSync('bk_userinfo');
    sessionid = app.globalData.default_sessionid;
    uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    this.setData({ sessionid, sessionid });
    this.setData({ uid, uid });
    this.getQuestionListGroupbyCourse();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    swan.hideTabBarRedDot({
      index: 3
    });
  },

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
  onShareAppMessage: function () {
    // console.log('sharecourseid=' + wx.getStorageSync('courseid') + '&sharecategoryid=' + wx.getStorageSync('categoryid'));
    var courseName = swan.getStorageSync('coursename');
    return {
      title: swan.getStorageSync('categoryname') + '-' + swan.getStorageSync('coursename'),
      desc: '问答中心',
      path: '/pages/answerquestion/answerquestion?sharecourseid=' + swan.getStorageSync('courseid') + '&sharecategoryid=' + swan.getStorageSync('categoryid') + '&sharecoursename=' + swan.getStorageSync('coursename') + '&sharecategoryname=' + swan.getStorageSync('categoryname')
    };
  },
  //有问必答_获取问题列表_考试分组
  getQuestionListGroupbyCourse: function () {
    var categoryid = swan.getStorageSync('categoryid');
    api.getQuestionListGroupbyCourse({
      methods: 'POST',
      data: {
        sessionid: this.data.sessionid,
        uid: this.data.uid,
        categoryid: categoryid
      },
      success: res => {
        let newList = [];
        let courselist = JSON.parse(swan.getStorageSync('bk_courselist'));
        swan.hideToast();
        var data = res.data;
        console.log(data);
        if (data.errcode == 0) {
          for (let i = 0; i < courselist.length; i++) {
            for (let j = 0; j < data.list.length; j++) {
              if (courselist[i].id == data.list[j].courseid) {
                newList.push(data.list[j]);
              }
            }
          }
          data.list = newList;
          var isreadnum = 0;
          for (var i = 0; i < data.list.length; i++) {
            if (data.list[i].replytime != "") {
              var replytime = Date.parse(this.strToDate(data.list[i].replytime.replace(/-/g, '/')));
              data.list[i].replytime = this.parseTime(replytime);
            }
            isreadnum += parseInt(data.list[i].isreadnum);
          }
          this.setData({ answerQuestionList: data.list });
          if (isreadnum > 0) {
            swan.setTabBarBadge({
              index: 3,
              text: String(isreadnum)
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
  answerQuestionTap: function (event) {
    var index = event.currentTarget.dataset.index;
    swan.navigateTo({
      url: '../me/answerQuestions/answerQuestions?courseid=' + this.data.answerQuestionList[index].courseid
    });
  },
  parseTime: function (time) {
    var data = new Date(time);
    var nowdata = new Date();
    var nowyy = nowdata.getFullYear();
    var yy = data.getFullYear();
    var nowMM = nowdata.getMonth() + 1;
    var MM = data.getMonth() + 1;
    var nowdd = nowdata.getDate();
    var dd = data.getDate();
    if (nowyy == yy && nowMM == MM && nowdd == dd) {
      var hh = data.getHours();
      if (hh > 12) {
        hh = '下午' + hh;
      } else {
        hh = '上午' + hh;
      }
      var mm = data.getMinutes();
      if (mm < 10) {
        mm = '0' + mm;
      }
      var ss = data.getSeconds();
      if (ss < 10) {
        ss = '0' + ss;
      }
      return `${hh}:${mm}`;
    } else {
      return `${MM}月${dd}日`;
    }

    // var dd = parseInt(time / 60 / 60 / 24);

    // var hh = parseInt(time / 60 / 60 % 24);
    // if (hh < 10) hh = '0' + hh;

    // var mm = parseInt(time / 60 % 60);
    // if (mm < 10) mm = '0' + mm;
    // var ss = parseInt(time % 60);
    // if (ss < 10) ss = '0' + ss;
    // if (hh > 0) {
    //   return `${hh}:${mm}`
    // }
    // return `${mm}:${ss}`
  },
  /**
    * 字符串转换为时间
    * @param  {String} src 字符串
    */
  strToDate: function (dateObj) {
    dateObj = dateObj.replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '').replace(/(-)/g, '/');
    dateObj = dateObj.slice(0, dateObj.indexOf("."));
    // return new Date(dateObj)    
    return dateObj;
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
            swan.setStorageSync('newCourseList', courselist)
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
  addQuestionClick: function () {
    var url = '../me/answerQuestions/addQuestion';
    swan.navigateTo({
      url: url
    });
  }
});