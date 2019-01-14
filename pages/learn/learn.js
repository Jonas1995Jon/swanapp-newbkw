// pages/learn/learn.js
import api from '../../api/api.js';
import request from '../../api/request.js';
import common from '../../utils/common.js';

//获取应用实例
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
      leftBtn: 0,
      leftBtnImg: '../../image/navigation/back.png',
      leftBtnTitle: '切换',
      centerBtn: 1,
      centerBtnUpImg: '../../image/navigation/up.png',
      centerBtnDownImg: '../../image/navigation/down.png',
      centerBtnTitle: '学习',
      backgroundColor: '1',
      centerBtnClick: 0
    },
    templateList: '',
    switchClassCategory: 0, //是否选择分类用于回调
    touchStart: '0',
    record: [],
    bigmoduleicon: ['../../image/home/home_icon_listening.png', '../../image/home/home_icon_live.png', '../../image/home/home_icon_video.png', '../../image/home/home_icon_subject.png']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var sharecourseid = options.sharecourseid;
    var sharecategoryid = options.sharecategoryid;
    var sharecoursename = options.sharecoursename;
    var sharecategoryname = options.sharecategoryname;
    if (sharecourseid != undefined && sharecategoryid != undefined && sharecoursename != undefined && sharecategoryname != undefined) {
      swan.setStorageSync('courseid', sharecourseid);
      swan.setStorageSync('categoryid', sharecategoryid);
      swan.setStorageSync('coursename', sharecoursename);
      swan.setStorageSync('categoryname', sharecategoryname);
      this.getCourseByCategory(sharecategoryid);
    } else {
      this.setSwitchClassCategory(swan.getStorageSync('navIndex') > 0 ? swan.getStorageSync('navIndex') : 0);
    }
    this.checkcourse_v9();
    this.bkwappindexadlist();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    swan.setNavigationBarTitle({
      title: swan.getStorageSync('categoryname')
    });
    bk_userinfo = swan.getStorageSync('bk_userinfo');
    sessionid = app.globalData.default_sessionid;
    uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    //切换课程两种情况1、从我的课程进入2、从选择分类进入
    if (this.data.switchClassCategory == 1) {
      this.setSwitchClassCategory(swan.getStorageSync('navIndex') > 0 ? swan.getStorageSync('navIndex') : 0);
      this.checkcourse_v9();
      this.bkwappindexadlist();
    } else {
      //解决切换考试数据刷新问题
      var courseidSNC = swan.getStorageSync('courseid');
      if (courseid != courseidSNC && courseid != undefined) {
        courseid = courseidSNC;
        if (courseid.length > 0) {
          var categoryid = swan.getStorageSync('categoryid');
          this.setSwitchClassCategory(swan.getStorageSync('navIndex') > 0 ? swan.getStorageSync('navIndex') : 0);
          this.checkcourse_v9();
          this.bkwappindexadlist();
        }
      }
    }
    //修改考期后重新请求检查课程信息
    if (this.data.refresh == 1) {
      request.request_checkcourse();
      this.setData({
        refresh: 0
      });
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () { },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () { },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () { },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () { },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var courseName = swan.getStorageSync('coursename');
    return {
      title: swan.getStorageSync('categoryname') + '-' + swan.getStorageSync('coursename'),
      desc: '帮考网学习中心',
      path: '/pages/learn/learn?sharecourseid=' + swan.getStorageSync('courseid') + '&sharecategoryid=' + swan.getStorageSync('categoryid') + '&sharecoursename=' + swan.getStorageSync('coursename') + '&sharecategoryname=' + swan.getStorageSync('categoryname')
    };
  },
  checkIsBindding: function (url, type) {
    //url也当作index在使用
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    if (bk_userinfo == '' || bk_userinfo == null) {
      swan.showModal({
        title: '温馨提示',
        content: '您尚未登录帮考网，请先登录！',
        confirmText: "立即登录",
        cancelText: "残忍拒绝",
        success: function (res) {
          if (res.confirm) {
            var url = '../me/bind/bind';
            swan.navigateTo({
              url: url
            });
          } else {
            return;
          }
        }
      });
    } else {
      if (type == 14) {
        this.checkIsBuy(url, type);
      } else { }
    }
  },
  checkIsBuy: function (index, type) {
    var checkcourseVO = swan.getStorageSync('checkcourseVO');
    var learnType;
    if (type == 14) {
      if (type == 14 && checkcourseVO.m14 == 1) {
        //国家精讲
        var url = '../video/video?back=1&cover=' + this.data.gjjcjj.cover;
        swan.navigateTo({
          url: url
        });
      } else {
        swan.showModal({
          title: '温馨提示',
          content: '您尚未购买此课程，请先购买！',
          confirmText: "立即购买",
          cancelText: "残忍拒绝",
          success: function (res) {
            if (res.confirm) {
              var url = '../course/buyCourse/buyCourseDetail/buyCourseDetail';
              swan.navigateTo({
                url: url
              });
            } else {
              return;
            }
          }
        });
      }
    }
  },
  //拨打电话
  calling: function () {
    swan.makePhoneCall({
      phoneNumber: '4006601360', //此号码并非真实电话号码，仅用于测试
      success: function () {
        console.log("拨打电话成功！");
      },
      fail: function () {
        console.log("拨打电话失败！");
      }
    });
  },
  getformalcourseterm: function () {
    var courseid = swan.getStorageSync('courseid');
    var categoryid = swan.getStorageSync('categoryid');
    if (categoryid == '' || categoryid == null) {
      swan.redirectTo({
        url: '../learn/classCategory/classCategory'
      });
      return;
    }
    api.getformalcourseterm({
      methods: 'POST',
      data: {
        courseid: courseid,
        categoryid: categoryid
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          var formalCourseList = data.list;
          if (formalCourseList.length > 0) {
            var iconArrs = ['../../image/learn/record/introductory_learn.png', '../../image/learn/record/textbook_refinement.png', '../../image/learn/record/fine_exercises.png', '../../image/learn/record/exam_crosstalk.png'];

            var title = null;
            var icon = null;
            var id = null;
            var recordItem = {};
            var recordArrs = this.data.record;
            for (var i = 0; i < formalCourseList.length; i++) {
              title = formalCourseList[i].title;
              id = formalCourseList[i].id;
              if (title.length < 1) {
                title = formalCourseList[i].subtitle;
              }
              if (i >= recordArrs.length - 4) {
                icon = iconArrs[i];
              } else {
                icon = iconArrs[3];
              }
              recordItem = {
                id: id,
                icon: icon,
                title: title,
                show: true
              };
              recordArrs.push(recordItem);
            }
            if (recordArrs.length % 3 != 0) {
              var recordArrsLength = (recordArrs.length - 4) % 3 - 1;
              if (recordArrsLength < 1) {
                recordArrsLength = 1;
              }
              for (var i = 0; i < recordArrsLength; i++) {
                recordArrs.push({
                  id: '',
                  icon: '',
                  title: '',
                  show: true
                });
              }
            }
            this.setData({ record: recordArrs });
          }
          //this.setData({ publicCourse: data });
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
  recordClick: function (event) {
    var index = event.currentTarget.dataset.index;
    var id = event.currentTarget.dataset.id;
    this.checkIsBindding(index, parseInt(id));
  },
  redPacketClick: function () {
    var url = '../activity/fightgroups/fightgroups';
    swan.navigateTo({
      url: url
    });
  },
  getTemplateByCategoryid: function () {
    var categoryid = swan.getStorageSync('categoryid');
    if (categoryid == '' || categoryid == null) {
      swan.redirectTo({
        url: '../learn/classCategory/classCategory'
      });
      return;
    }
    api.getTemplateByCategoryid({
      methods: 'POST',
      data: {
        categoryid: categoryid
      },
      success: res => {
        swan.hideToast();
        var data = res.data;

        if (data.errcode == 0) {
          var templateList = data.list;

          // if (templateList.length > 0) {
          this.setData({ templateList: templateList });
          // }
          //this.setData({ publicCourse: data });
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
  // onPageScroll: function (e) {
  //   if(e.scrollTop > 0){
  //     this.setData({ touchStart: 1 });
  //   }else{
  //     this.setData({ touchStart: 0 });
  //   }
  // },
  // 触摸开始事件  
  touchStart: function (e) {
    this.setData({ touchStart: 1 });
  },
  // 触摸结束事件  
  touchEnd: function (e) {
    this.setData({ touchStart: 0 });
  },
  getShuaticountLivecountVodcount: function () {
    if (courseid == undefined) {
      courseid = swan.getStorageSync('courseid');
      bk_userinfo = swan.getStorageSync('bk_userinfo');
      sessionid = app.globalData.default_sessionid;
      uid = app.globalData.default_uid;
      if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
        sessionid = bk_userinfo.sessionid;
        uid = bk_userinfo.uid;
      }
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
        if (data.errcode == 0) {
          data.shuaticount = data.shuaticount + '道';
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
  leftBtnClick: function () {
    var url = 'classCategory/classCategory';
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
    var centerBtnClickIndex = swan.getStorageSync('centerBtnClickIndex');
    if (centerBtnClickIndex == undefined) {
      centerBtnClickIndex = 0;
    }
    this.setData({
      navigation: {
        leftBtn: 0,
        // leftBtnImg: '../../image/navigation/back.png',
        leftBtnTitle: '切换',
        centerBtn: 1,
        centerBtnUpImg: '../../image/navigation/up.png',
        centerBtnDownImg: '../../image/navigation/down.png',
        centerBtnTitle: this.data.navigation.viewTitleList[centerBtnClickIndex],
        backgroundColor: '1',
        centerBtnClick: index,
        viewTitleList: this.data.navigation.viewTitleList
        // rightBtn: 0,
        // rightBtnImg: '../../image/navigation/back.png',
        // rightBtnTitle: '',
      }
    });
  },
  downviewClick: function (event) {
    var centerBtnIndex = this.data.navigation.centerBtnIndex;
    if (centerBtnIndex == 0) {
      centerBtnIndex = 1;
    } else {
      centerBtnIndex = 0;
    }
    var index = event.currentTarget.dataset.index;
    if (this.data.navigation.centerBtnTitle == this.data.navigation.viewTitleList[index]) {
      this.setData({
        navigation: {
          leftBtn: 0,
          // leftBtnImg: '../../image/navigation/back.png',
          leftBtnTitle: '切换',
          centerBtn: 1,
          centerBtnUpImg: '../../image/navigation/up.png',
          centerBtnDownImg: '../../image/navigation/down.png',
          centerBtnTitle: this.data.navigation.viewTitleList[index],
          backgroundColor: '1',
          centerBtnClick: centerBtnIndex,
          viewTitleList: this.data.navigation.viewTitleList
          // rightBtn: 0,
          // rightBtnImg: '../../image/navigation/back.png',
          // rightBtnTitle: '',
        }
      });
      return;
    } else {
      this.setData({
        navigation: {
          leftBtn: 0,
          // leftBtnImg: '../../image/navigation/back.png',
          leftBtnTitle: '切换',
          centerBtn: 1,
          centerBtnUpImg: '../../image/navigation/up.png',
          centerBtnDownImg: '../../image/navigation/down.png',
          centerBtnTitle: this.data.navigation.viewTitleList[index],
          backgroundColor: '1',
          centerBtnClick: centerBtnIndex,
          viewTitleList: this.data.navigation.viewTitleList
          // rightBtn: 0,
          // rightBtnImg: '../../image/navigation/back.png',
          // rightBtnTitle: '',
        }
      });
    }
    swan.setStorageSync('centerBtnClickIndex', index);
    swan.setStorageSync('courseid', this.data.courselist[index].id);
    courseid = swan.getStorageSync('courseid');
    //单单切换顶部课程只需重新组装直播数据和顶部数据
    this.getShuaticountLivecountVodcount();
  },
  /**
   * 选择分类后相关设置
   */
  setSwitchClassCategory: function (index) {
    courseid = swan.getStorageSync('courseid');
    if (courseid == '' || courseid == null) {
      swan.redirectTo({
        url: '../learn/classCategory/classCategory'
      });
      return;
    }
    let bk_courselist = swan.getStorageSync('bk_courselist');
    var courselist = '';
    if (bk_courselist != '' && bk_courselist != null && bk_courselist != undefined) {
      courselist = JSON.parse(swan.getStorageSync('bk_courselist'));
    }
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
      this.getShuaticountLivecountVodcount();
      this.getTemplateByCategoryid();
    }
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
    request.request_checkcourse();
    that.setSwitchClassCategory(index);
    this.checkcourse_v9();
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

  bkwappindexadlist: function () {
    var categoryid = swan.getStorageSync('categoryid');
    var that = this;
    api.bkwappindexadlist({
      method: 'POST',
      data: {
        categoryid: categoryid,
        market: app.globalData.market
      },
      success: function (res) {
        var data = res.data;
        if (data.errcode == '0') {
          if (data.list.length > 0) {
            that.setData({
              lunbolist: data.list
            });
          }
        }
      }
    });
  },
  buycourse: function () {
    var url = '../course/buyCourse/buyCourseDetail/buyCourseDetail';
    swan.navigateTo({
      url: url
    });
  },
  bigmoduleTap: function (even) {
    var index = even.currentTarget.dataset.index;
    switch (index) {
      case 0:
        swan.navigateTo({
          url: '../auditions/auditions'
        });
        break;
      case 1:
        var url = '../livelist/livePublicList';
        swan.navigateTo({
          url: url
        });
        break;
      case 2:
        swan.navigateTo({
          url: '../learn/liveVideoNum/liveVideoNum'
        });
        break;
      case 3:
        swan.navigateTo({
          url: '../learn/brushNum/brushNum'
        });
        break;
      default:
        break;
    }
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
    var bigmoduleicon = this.data.bigmoduleicon;
    api.checkcourse({
      method: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid
      },
      success: function (res) {
        var data = res.data;
        if (data.errcode == 0) {
          //请求成功读取试题-v2.3
          if (data.bigmodule != undefined) {
            for (var i = 0; i < data.bigmodule.length; i++) {
              data.bigmodule[i].icon = bigmoduleicon[i];
            }
            that.setData({
              bigmodule: data.bigmodule,
              // showmoduletohome: data.showmoduletohome,
              live_module: data.live_module
            });
            swan.setStorageSync('live_module', data.live_module);
          }
          if (data.showmoduletohome != undefined && data.showmoduletohome.length > 0) {
            for (var i = 0; i < data.showmoduletohome.length; i++) {
              if (data.showmoduletohome[i].module == 'm14') {
                that.setData({
                  gjjcjj: data.showmoduletohome[i]
                });
              }
            }
          } else {
            that.setData({
              gjjcjj: ''
            });
          }
        } else if (data.errcode == 40036) {//请先购买课程

        } else if (data.errcode == 40052) {
          //未找到会话信息，请重新登录
          request_thirdauth(0);
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
  }
});