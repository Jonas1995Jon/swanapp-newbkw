// pages/agreement/details/detail.js
import api from '../../../api/api.js';
import request from '../../../api/request.js';
import common from '../../../utils/common.js';
var DOMParser = require('../../../utils/xmldom/dom-parser').DOMParser;
var XMLSerializer = require('../../../utils/xmldom/dom-parser').XMLSerializer;
var WxParse = require('../../../utils/wxParse/wxParse.js');
//获取应用实例
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navigation: {
      leftBtn: 0,
      leftBtnImg: '../../../image/navigation/back.png',
      centerBtn: 0,
      centerBtnTitle: '保过协议'
    },
    agreement: '',
    supplementid: '',
    agreementList: '',
    countDownNum: '10' //倒计时初始值
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var agreementList = JSON.parse(options.agreementList);
    this.setData({ agreementList: agreementList });
    var supplementid = options.supplementid;
    this.setData({ supplementid: supplementid });
    this.getagreement();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.countDown();
  },

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
  /** 
  * 补签协议-查询是否可以补签协议
  */
  getagreement: function () {
    api.getagreement({
      methods: 'POST',
      data: {
        supplementid: this.data.supplementid
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          var agreement = decodeURIComponent(data.agreement);
          agreement = agreement.replace(/\+/g, " ");
          agreement = agreement.replace(/\{LinkMan}/g, this.data.agreementList.linkman);
          agreement = agreement.replace(/\{IDCard}/g, this.data.agreementList.idcard);
          agreement = agreement.replace(/\{Tel}/g, this.data.agreementList.mobile);
          agreement = agreement.replace(/\{Email}/g, this.data.agreementList.email);
          agreement = agreement.replace(/\{Price}/g, this.data.agreementList.courselist[0].price);
          this.setData({ agreement: agreement });
          WxParse.wxParse('agreement', 'html', agreement, this, 5);
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
    swan.navigateBack({});
  },
  countDown: function () {
    let that = this;
    let countDownNum = that.data.countDownNum;
    that.setData({
      timer: setInterval(function () {
        countDownNum--;
        that.setData({
          countDownNum: countDownNum
        });
        if (countDownNum == 0) {
          clearInterval(that.data.timer);
        }
      }, 1000)
    });
  },
  /** 
  * 补签协议-查询是否可以补签协议
  */
  protocolClick: function () {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = app.globalData.default_sessionid;
    var uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    var agreementList = this.data.agreementList;
    var supplementid = agreementList.supplementid;
    var linkman = agreementList.linkman;
    var idcard = agreementList.idcard;
    var mobile = agreementList.mobile;
    var address = agreementList.address;
    var email = agreementList.email;
    var zip = agreementList.zip;
    api.supplement({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        supplementid: supplementid,
        linkman: linkman,
        idcard: idcard,
        mobile: mobile,
        address: address,
        email: email,
        zip: zip
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          var pages = getCurrentPages();
          var page = pages[pages.length - 3];
          //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
          page.setData({
            isSignAgreement: true
          });
          swan.navigateBack({
            delta: pages.length - 3
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
  }
});