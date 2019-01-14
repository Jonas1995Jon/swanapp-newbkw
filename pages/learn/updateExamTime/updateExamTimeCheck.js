// pages/learn/updateExamTime/updateExamTimeCheck.js
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
    token: '',
    mobile: '获取手机号失败',
    infoid: '',
    codeType: 0, //0绑定账户获取手机验证码，1忘记密码获取手机验证码
    // focus: [
    //   { focus: false },
    //   { focus: false },
    //   { focus: false },
    //   { focus: false },
    //   { focus: false },
    //   { focus: false },
    // ],
    // focus_value1: '',
    // focus_value2: '',
    // focus_value3: '',
    // focus_value4: '',
    // focus_value5: '',
    // focus_value6: '',
    focus_value: '',
    second: 60,
    secondMsg: '获取验证码',
    sendCodeBtnDisabled: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var token = options.token;
    this.setData({ token: token });
    this.myaccount();
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
  bindKeyInput: function (e) {
    // var index = e.currentTarget.dataset.hi;
    // var thisText = e.detail.value;
    // var focus = [];
    // switch (parseInt(index)) {
    //   case 0:
    //     this.setData({ focus_value1: thisText });
    //     for (var i = 0; i < 6; i++) {
    //       if (i == 0) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value1 });
    //       }
    //       if (i == 1) {
    //         if (thisText != null && thisText != "") {
    //           focus.push({ focus: true, focus_value: this.data.focus_value2 });
    //         } else {
    //           focus.push({ focus: false, focus_value: this.data.focus_value2 });
    //         }
    //       }
    //       if (i == 2) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value3 });
    //       }
    //       if (i == 3) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value4 });
    //       }
    //       if (i == 4) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value5 });
    //       }
    //       if (i == 5) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value6 });
    //       }
    //     }
    //     break;
    //   case 1:
    //     this.setData({ focus_value2: thisText });
    //     for (var i = 0; i < 6; i++) {
    //       if (i == 0) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value1 });
    //       }
    //       if (i == 1) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value2 });
    //       }
    //       if (i == 2) {
    //         if (thisText != null && thisText != "") {
    //           focus.push({ focus: true, focus_value: this.data.focus_value3 });
    //         } else {
    //           focus.push({ focus: false, focus_value: this.data.focus_value3 });
    //         }
    //       }
    //       if (i == 3) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value4 });
    //       }
    //       if (i == 4) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value5 });
    //       }
    //       if (i == 5) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value6 });
    //       }
    //     }
    //     break;
    //   case 2:
    //     this.setData({ focus_value3: thisText });
    //     for (var i = 0; i < 6; i++) {
    //       if (i == 0) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value1 });
    //       }
    //       if (i == 1) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value2 });
    //       }
    //       if (i == 2) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value3 });
    //       }
    //       if (i == 3) {
    //         if (thisText != null && thisText != "") {
    //           focus.push({ focus: true, focus_value: this.data.focus_value4 });
    //         } else {
    //           focus.push({ focus: false, focus_value: this.data.focus_value4 });
    //         }
    //       }
    //       if (i == 4) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value5 });
    //       }
    //       if (i == 5) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value6 });
    //       }
    //     }
    //     break;
    //   case 3:
    //     this.setData({ focus_value4: thisText });
    //     for (var i = 0; i < 6; i++) {
    //       if (i == 0) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value1 });
    //       }
    //       if (i == 1) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value2 });
    //       }
    //       if (i == 2) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value3 });
    //       }
    //       if (i == 3) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value4 });
    //       }
    //       if (i == 4) {
    //         if (thisText != null && thisText != "") {
    //           focus.push({ focus: true, focus_value: this.data.focus_value5 });
    //         } else {
    //           focus.push({ focus: false, focus_value: this.data.focus_value5 });
    //         }
    //       }
    //       if (i == 5) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value6 });
    //       }
    //     }
    //     break;
    //   case 4:
    //     this.setData({ focus_value5: thisText });
    //     for (var i = 0; i < 6; i++) {
    //       if (i == 0) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value1 });
    //       }
    //       if (i == 1) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value2 });
    //       }
    //       if (i == 2) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value3 });
    //       }
    //       if (i == 3) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value4 });
    //       }
    //       if (i == 4) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value5 });
    //       }
    //       if (i == 5) {
    //         if (thisText != null && thisText != "") {
    //           focus.push({ focus: true, focus_value: this.data.focus_value6 });
    //         } else {
    //           focus.push({ focus: false, focus_value: this.data.focus_value6 });
    //         }
    //       }
    //     }
    //     break;
    //   case 5:
    //     this.setData({ focus_value6: thisText });
    //     for (var i = 0; i < 6; i++) {
    //       if (i == 0) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value1 });
    //       }
    //       if (i == 1) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value2 });
    //       }
    //       if (i == 2) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value3 });
    //       }
    //       if (i == 3) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value4 });
    //       }
    //       if (i == 4) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value5 });
    //       }
    //       if (i == 5) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value6 });
    //       }
    //     }
    //     break;
    //   default:
    //     break;
    // }
    // this.setData({
    //   password_value: e.detail.value,
    //   password_lenght: thisText.length,
    //   focus: focus,
    // });
    // var yzm = this.data.focus_value1 + this.data.focus_value2 + this.data.focus_value3 + this.data.focus_value4 + this.data.focus_value5 + this.data.focus_value6;
    // if (yzm.length == 6) {
    //   this.checkCode();
    // }
    var index = e.currentTarget.dataset.hi;
    var thisText = e.detail.value;
    this.setData({
      password_value: e.detail.value,
      password_lenght: thisText.length,
      focus_value: thisText
    });
    var yzm = this.data.focus_value;
    if (yzm.length == 6) {}
    this.checkCode();
  },
  checkCode: function () {
    if (this.datafocus_value == "") {
      swan.showModal({
        title: '提示',
        content: '请输入6位验证码',
        showCancel: false
      });
    } else {
      var yzm = this.data.focus_value;
      if (yzm.length == 6) {
        var bk_userinfo = swan.getStorageSync('bk_userinfo');
        var sessionid = bk_userinfo.sessionid;
        var uid = bk_userinfo.uid;
        if (sessionid == undefined) {
          return;
        }
        api.changekqCheckyzm({
          methods: 'POST',
          data: {
            sessionid: sessionid,
            uid: uid,
            token: this.data.token,
            yzm: yzm
          },
          success: res => {
            var data = res.data;
            if (data.errcode == 0) {
              //验证码发送成功,微信小程序页面限制只能返回一个页面再跳转
              var pages = getCurrentPages();
              var prevPage = pages[0]; //第一个页面

              //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
              prevPage.setData({
                refresh: 1
              });
              swan.navigateBack({
                delta: pages.length - 1
              });
            } else {
              //验证码发送失败等错误
              swan.showToast({
                title: data.errmsg,
            icon: 'success',
            duration: 1500
              });
            }
            console.log(data);
          }
        });
      } else {
        swan.showModal({
          title: '提示',
          content: '请输入6位验证码',
          showCancel: false
        });
      }
    }
  },
  sendCode: function () {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = bk_userinfo.sessionid;
    var uid = bk_userinfo.uid;
    if (sessionid == undefined) {
      return;
    }
    api.sendyzm({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        token: this.data.token,
        mobile: this.data.mobile
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          //验证码发送成功
          this.countdown(this);
        } else {
          //验证码发送失败等错误
          swan.showToast({
            title: data.errmsg,
            icon: 'success',
            duration: 1500
          });
        }
        console.log(data);
      }
    });
  },
  // 从从60到到0倒计时  
  countdown: function (that) {
    var second = that.data.second;
    if (second == 0) {
      that.setData({
        second: 60,
        secondMsg: "重新获取",
        sendCodeBtnDisabled: false
      });
      return;
    }
    var time = setTimeout(function () {
      that.setData({
        second: second - 1,
        sendCodeBtnDisabled: true
      });
      that.setData({
        secondMsg: that.data.second + 's后重新获取'
      });
      that.countdown(that);
    }, 1000);
  },
  myaccount: function () {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = bk_userinfo.sessionid;
    var uid = bk_userinfo.uid;
    if (sessionid == undefined) {
      return;
    }
    api.myaccount({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          this.setData({ mobile: data.tel });
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