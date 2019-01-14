import api from '../../../api/api.js';
import request from '../../../api/request.js';
import common from '../../../utils/common.js';
import md5 from '../../../utils/md5.js';
//获取应用实例
var app = getApp();
var interval;
var indexcheck;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    checkedshow: true,
    nocheckedshow: true,
    invalidtitle: '失效优惠券'
    // couponList: [
    //   {
    //     coupontype:'allcategorydiscount',
    //     price:2121,
    //     title:'dfasfsaf',
    //     validtime:'12341234123'
    //   }, {
    //     coupontype: 'allcategorydiscount',
    //     price: 2121,
    //     title: 'dfasfsaf',
    //     validtime: '12341234123'
    //   }
    // ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.checkedshow == 'false') {
      indexcheck = 1;
      this.setData({
        couponclick: 'couponclick'
      });
    } else {
      indexcheck = 2;
    }
    this.mycoupon(0);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (indexcheck == 1) {
      var couponList = this.data.couponList;
      console.log(couponList);
      if (couponList.length != undefined) {
        console.log(couponList.length);
        if (couponList.length > 0) {
          for (var i = 0; i < couponList.length; i++) {
            couponList[i].indexcheck = false;
          }
        }
      }
    }
  },

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
  checkedclick: function (e) {
    var index = e.currentTarget.dataset.index;
    var couponList = this.data.couponList;
    if (couponList.length != undefined) {
      if (couponList.length > 0) {
        for (var i = 0; i < couponList.length; i++) {
          couponList[i].indexcheck = false;
        }
        couponList[index].indexcheck = true;
        this.setData({
          couponList: couponList
        });
      }
    }
  },
  couponclick: function () {
    swan.navigateTo({
      url: '../recharge/invalidcoupon'
    });
  },
  //我的优惠券
  mycoupon: function (isexpired) {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = bk_userinfo.sessionid;
    var uid = bk_userinfo.uid;
    api.mycoupon({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        isexpired: isexpired
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        console.log(data);
        if (data.errcode == 0) {
          // if (data.list.length > 0) {
          //   for (var i = 0; i < data.list.length; i++) {
          //     data.list[i].selected = 0;
          //     if (data.list[i].coupontype == "allcategorydiscount") {
          //       data.list[i].des = "通用";
          //       data.list[i].price = parseFloat(data.list[i].price * 10);
          //     } else {
          //       data.list[i].des = "满" + parseInt(data.list[i].needamount) + "元可用";
          //       data.list[i].price = parseFloat(data.list[i].price).toFixed(0);
          //     }
          //   }
          // }
          for (var i = 0; i < data.list.length; i++) {
            data.list[i].price = parseInt(data.list[i].price);
          }
          this.setData({ couponList: data.list });
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