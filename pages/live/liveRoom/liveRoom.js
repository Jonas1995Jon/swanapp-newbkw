// pages/video/liveRoom.js
import api from '../../../api/api.js';
import request from '../../../api/request.js';
import common from '../../../utils/common.js';
//获取应用实例
var app = getApp();
var logsTimer = null;

var bk_userinfo;
var sessionid;
var uid;
var courseid;
var openid;
var channelnumber;
var nickname;
var headurl;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navigation: {
      leftBtn: 1,
      leftBtnImg: '../../../image/navigation/back.png',
      centerBtn: 0,
      centerBtnTitle: '帮考直播课堂'
    },
    layeranimation: {},
    shadeimation: {},
    modal: true,
    title: '直播教室',
    videoUrl: '',
    teacher: 'http://attachment.cnbkw.com/bkwimg/up/201705/d6b6f2b54fa34bc3822c7cfb02f00625.jpg',
    videoContext: '',
    action: '',
    module: '',
    channelnumber: '',
    shareUrl: ''
  },
  leftBtnClick: function () {
    swan.navigateBack({});
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var videoUrl = options.videoUrl;
    bk_userinfo = swan.getStorageSync('bk_userinfo');
    sessionid = app.globalData.default_sessionid;
    uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    courseid = swan.getStorageSync('courseid');
    categoryid = swan.getStorageSync('categoryid');
    openid = swan.getStorageSync('wx_openid');
    var userinfo = swan.getStorageSync('userinfo');
    if (openid.length < 1) {
      swan.showModal({
        title: '温馨提示',
        content: '新用户需先绑定账户信息，立即前往个人中心。',
        confirmText: "确定",
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            var url = '../../me/me';
            swan.switchTab({
              url: url
            });
          }
        }
      });
      return;
    }

    //1、通过分享进入
    var sharecourseid = options.sharecourseid;
    var sharecategoryid = options.sharecategoryid;
    var sharecoursename = options.sharecoursename;
    var sharecategoryname = options.sharecategoryname;

    var channelnumber = options.channelnumber;
    var chatroomid = options.chatroomid;

    this.setData({channelnumber: channelnumber});

    nickname = encodeURIComponent(encodeURIComponent(userinfo.nickName));
    headurl = encodeURIComponent(encodeURI(userinfo.avatarUrl));

    // console.log(sharecourseid + sharecategoryid + sharecoursename + sharecategoryname);
    if (sharecourseid != undefined && sharecategoryid != undefined && sharecoursename != undefined && sharecategoryname != undefined) {
      swan.setStorageSync('courseid', sharecourseid);
      swan.setStorageSync('categoryid', sharecategoryid);
      swan.setStorageSync('coursename', sharecoursename);
      swan.setStorageSync('categoryname', sharecategoryname);
      courseid = swan.getStorageSync('courseid');
      categoryid = swan.getStorageSync('categoryid');
      this.getCourseByCategory(sharecategoryid);
    } else {
      if (videoUrl == undefined) {
        //2、通过扫码进入
        if (channelnumber != undefined && chatroomid != undefined) {
          this.setData({
            channelnumber: channelnumber
          });
          this.setData({
            chatroomid: chatroomid
          });
          // var courseid = 1543;
          // var categoryid = 1183;
          var courseid = options.courseid;
          var categoryid = options.categoryid;
          if (categoryid != undefined && courseid != undefined) {
            swan.setStorageSync('courseid', courseid);
            swan.setStorageSync('categoryid', categoryid);
            courseid = swan.getStorageSync('courseid');
            categoryid = swan.getStorageSync('categoryid');
            this.getCourseByCategory(categoryid);
            this.getvideocodebychannelnumber(25, channelnumber, chatroomid, 0);
          } else {
            this.setData({
              shareUrl: "http://www.cnbkw.com/baiduCX/chatroom?roomid=" + chatroomid + "&channelnumber=" + channelnumber + '&openid=' + openid + '&nickname=' + nickname + '&headurl=' + headurl
            });
          }
        } else {
          if (channelnumber != undefined) {
            this.setData({
              channelnumber: channelnumber
            });
            this.setData({
              shareUrl: "http://www.cnbkw.com/baiduCX/chatroom?roomid=" + chatroomid + "&channelnumber=" + channelnumber + '&openid=' + openid + '&nickname=' + nickname + '&headurl=' + headurl
            });
          } else {
            var url = '../../me/me';
            swan.switchTab({
              url: url
            });
          }
        }
      } else {
        videoUrl = decodeURI(options.videoUrl);
        var pages = getCurrentPages();
        if (pages.length == 1) {
          videoUrl = decodeURIComponent(videoUrl);
        }
        this.setData({
          videoUrl: videoUrl
        });
      }
    }

    var title;
    if (options.title != undefined) {
      title = decodeURI(options.title);
    } else {
      title = "帮考网直播课堂";
    }
    this.setData({
      title: title
    });
    var teacher;
    if (options.teacher != undefined) {
      teacher = JSON.parse(decodeURIComponent(options.teacher));
      this.setData({
        teacher: teacher
      });
    }
    var action;
    if (options.action != undefined) {
      action = options.action;
      this.setData({
        action: action
      });
    }

    var module;
    if (options.module != undefined) {
      module = options.module;
      this.setData({
        module: module
      });
    }

    if (videoUrl != undefined) {
      if (chatroomid == undefined) {
        this.setData({
          shareUrl: encodeURI("https://www.cnbkw.com/weixin/chatroom?url=" + videoUrl + "&title=" + encodeURIComponent(title) + "&openid=" + openid + "&headimgurl=" + userinfo.avatarUrl + "&weinxinnickname=" + userinfo.nickName)
        });
      } else {
        this.setData({
          shareUrl: encodeURI("https://www.cnbkw.com/weixin/chatroom?roomid=" + chatroomid + "&url=" + videoUrl + "&title=" + encodeURIComponent(title) + "&openid=" + openid + "&headimgurl=" + userinfo.avatarUrl + "&weinxinnickname=" + userinfo.nickName)
        });
      }
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
    // if (this.data.videoContext == '') {
    //   var videoContext = wx.createVideoContext('live_room');
    //   this.setData({ videoContext: videoContext });
    // } else {
    //   this.data.videoContext.play();
    // }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    if (this.data.videoContext.action != undefined) {
      this.data.videoContext.pause();
    }
    this.logsTimerStopHandler();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.logsTimerStopHandler();
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
  onShareAppMessage: function () {
    // console.log('/pages/live/liveRoom/liveRoom?chatroomid=' + this.data.chatroomid + '&videoUrl=' + this.data.videoUrl + '&title=' + this.data.title + '&action=' + this.data.action + '&module=' + this.data.module + '&channelnumber=' + this.data.channelnumber);
    // console.log('/pages/live/liveRoom/liveRoom?chatroomid=' + this.data.chatroomid + '&action=' + this.data.action + '&module=' + this.data.module + '&channelnumber=' + this.data.channelnumber );
    var path;
    if (this.data.chatroomid == undefined) {
      path = '/pages/live/liveRoom/liveRoom?action=' + this.data.action + '&module=' + this.data.module + '&channelnumber=' + this.data.channelnumber + '&sharecourseid=' + swan.getStorageSync('courseid') + '&sharecategoryid=' + swan.getStorageSync('categoryid') + '&sharecoursename=' + swan.getStorageSync('coursename') + '&sharecategoryname=' + swan.getStorageSync('categoryname');
    } else {
      path = '/pages/live/liveRoom/liveRoom?chatroomid=' + this.data.chatroomid + '&action=' + this.data.action + '&module=' + this.data.module + '&channelnumber=' + this.data.channelnumber + '&sharecourseid=' + swan.getStorageSync('courseid') + '&sharecategoryid=' + swan.getStorageSync('categoryid') + '&sharecoursename=' + swan.getStorageSync('coursename') + '&sharecategoryname=' + swan.getStorageSync('categoryname');
    }

    return {
      title: '帮考直播课堂',
      desc: '直播课程，互动式教学，真人在线直播。',
      path: '/pages/live/liveRoom/liveRoom?chatroomid=' + this.data.chatroomid + '&action=' + this.data.action + '&module=' + this.data.module + '&channelnumber=' + this.data.channelnumber + '&sharecourseid=' + swan.getStorageSync('courseid') + '&sharecategoryid=' + swan.getStorageSync('categoryid') + '&sharecoursename=' + swan.getStorageSync('coursename') + '&sharecategoryname=' + swan.getStorageSync('categoryname')
    };
  },
  /*打开弹框带动画*/
  openLayer: function () {
    this.setData({
      modal: false
    });
    var animationlayer = swan.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    });
    animationlayer.opacity(1).rotateX(0).step();
    this.setData({
      layeranimation: animationlayer.export()
    });
    var animationshade = swan.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    });
    animationshade.opacity(1).step();
    this.setData({
      modal: false,
      shadeimation: animationshade.export()
    });
  },
  /*打开弹框，防止点击内容被关闭*/
  showLyaer: function () {
    this.setData({
      modal: false
    });
  },
  /*关闭弹框，带动画*/
  closeLayer: function () {
    var animationlayer = swan.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    });
    animationlayer.opacity(0).rotateX(-120).step();
    this.setData({
      layeranimation: animationlayer.export()
    });
    var animationshade = swan.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    });
    animationshade.opacity(0).step();
    this.setData({
      shadeimation: animationshade.export()
    });
    setTimeout(function () {
      this.setData({
        modal: true
      });
    }.bind(this), 200);
  },
  //视频错误
  listenerVideo: function (event) {
    this.logsTimerStopHandler();
    console.log('listenerVideo' + event);
  },
  // 开始播发
  startPlay: function (event) {
    console.log('startPlay' + event);
    this.logsTimerHandler(); //视频日志记录
  },
  // 暂停播放
  pausePlay: function (event) {
    this.logsTimerStopHandler();
    console.log('pausePlay' + event);
  },
  // 播放至末尾
  endPlay: function (event) {
    this.logsTimerStopHandler();
    console.log('endPlay' + event);
  },
  //刷题记录日志定时器
  logsTimerHandler: function () {
    var nowDate = new Date();
    var addtime = common.formatTime(nowDate);
    var model;
    var os;
    var resolution;
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
          action: this.data.action,
          module: this.data.module,
          channelnumber: this.data.channelnumber,
          courseid: courseid,
          addtime: addtime,
          sessionid: sessionid,
          userid: uid,
          from: getApp().globalData.from,
          duration: 10,
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
        };if (this.data.action == undefined || this.data.module == undefined || this.data.channelnumber == undefined) {
          return;
        }
        request.request_collectLog(data);
      }, 10000);
    }
  },
  logsTimerStopHandler: function () {
    console.log('logsTimer stop');
    if (logsTimer) {
      clearInterval(logsTimer);
      logsTimer = null;
    }
  },
  saveWechatImage: function () {
    swan.downloadFile({
      url: 'https://imgcdn.cnbkw.com/ws_wechat.png',
      type: 'image',
      success: function (res) {
        let tempFilePath = res.tempFilePath;
        swan.saveImageToPhotosAlbum({
          filePath: tempFilePath,
          success(res) {
            swan.showToast({
              title: '保存图片成功',
              icon: 'succes',
              duration: 1000,
              mask: true
            });
            // wx.scanCode({
            //   success: (res) => {
            //     console.log(res)
            //   }
            // });
            // // 允许从相机和相册扫码
            // wx.scanCode({
            //   success: (res) => {
            //     console.log(res)
            //   }
            // })
          },
          fail: function (res) {
            console.log("保存图片失败");
            console.log(res);
          }
        });
        console.log("download success");
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },
  copyTextClick: function (event) {
    var text = event.currentTarget.dataset.hi;
    swan.setClipboardData({
      data: text,
      success: function (res) {
        swan.showToast({
          title: '复制成功！',
          icon: 'succes',
          duration: 1000,
          mask: true
        });
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
          var bigclass = swan.getStorageSync('bk_bigclass');
          var smallclassTemp;
          var categoryidTemp;
          for (var i = 0; i < courselist.length; i++) {
            courselist[i].title = decodeURI(courselist[i].title);
            courselist[i].shorttitle = decodeURI(courselist[i].shorttitle);
          }
          for (var i = 0; i < courselist.length; i++) {
            if (swan.getStorageSync('courseid') == courselist[i].id) {
              swan.setStorageSync('coursename', courselist[i].title);
              for (var i = 0; i < bigclass.length; i++) {
                smallclassTemp = bigclass[i].smallclass;
                for (var j = 0; j < smallclassTemp.length; j++) {
                  categoryidTemp = smallclassTemp[j].id;
                  if (id == categoryidTemp) {
                    swan.setNavigationBarTitle({
                      title: smallclassTemp[j].title
                    });
                    swan.setStorageSync('categoryname', smallclassTemp[j].title);
                  }
                }
              }
            }
          }
          var courselist = JSON.stringify(courselist);
          swan.setStorageSync('bk_courselist', courselist);
          if (courselist != undefined && courselist.length > 0) {
            swan.setStorageSync('centerBtnClickIndex', 0);
            swan.setStorageSync('courseid', data.courselist[0].id);
            swan.setStorageSync('coursename', data.courselist[0].title);
            swan.setStorageSync('categoryid', id);
          }
          // videoCategoryid = "";
          // videoCourseid = "";
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
   * 检查课程信息
   */
  getvideocodebychannelnumber: function (videotype, channelnumber, chatroomid, index) {
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
        if (data.errcode == 0) {
          if (this.data.chatroomid != undefined && this.data.channelnumber != undefined) {
            this.setData({
              shareUrl: "http://www.cnbkw.com/baiduCX/chatroom?roomid=" + chatroomid + "&channelnumber=" + channelnumber + '&openid=' + openid + '&nickname=' + nickname + '&headurl=' + headurl
            });
          } else if (this.data.channelnumber != undefined) {
            this.setData({
              shareUrl: "http://www.cnbkw.com/baiduCX/chatroom?roomid=" + chatroomid + "&channelnumber=" + channelnumber + '&openid=' + openid + '&nickname=' + nickname + '&headurl=' + headurl
            });
          } else {
            var url = '../../me/me';
            swan.switchTab({
              url: url
            });
          }
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
                  url: '../../course/buyCourse/buyCourseDetail/buyCourseDetail'
                });
              } else {
                var url = '../../me/me';
                swan.switchTab({
                  url: url
                });
              }
            }
          });
        } else if (data.errcode == 40052) {
          //未找到会话信息，请重新登录
          request.request_thirdauth(0);
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
        content: '您尚未绑定帮考网账号，请先绑定！',
        confirmText: "立即绑定",
        cancelText: "残忍拒绝",
        success: function (res) {
          if (res.confirm) {
            var bindurl = '../../me/bind/bind';
            swan.navigateTo({
              url: bindurl
            });
          } else {
            var url = '../../me/me';
            swan.switchTab({
              url: url
            });
          }
        }
      });
      return false;
    } else {
      return true;
    }
  }
});