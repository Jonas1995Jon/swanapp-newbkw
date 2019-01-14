// pages/learn/classCategory/classCategory.js
import api from '../../../api/api.js';
import common from '../../../utils/common.js';
//获取应用实例
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navigation: {
      leftBtn: 1,
      leftBtnImg: '../../../image/navigation/back.png',
      centerBtn: 0,
      centerBtnTitle: '切换考试'
    },
    jrImgArr: ["../../../image/learn/jr/course_jr4.png", "../../../image/learn/jr/course_jr5.png", "../../../image/learn/jr/course_jr1.png", "../../../image/learn/jr/course_jr2.png", "../../../image/learn/jr/course_jr3.png", "../../../image/learn/jr/course_jr6.png", "../../../image/learn/jr/course_jr7.png", "../../../image/learn/jr/course_jr8.png", "../../../image/learn/jr/course_jr9.png", "../../../image/learn/jr/course_jr10.png"],
    ckImgArr: ["../../../image/learn/ck/course_ck1.png", "../../../image/learn/ck/course_ck2.png", "../../../image/learn/ck/course_ck3.png", "../../../image/learn/ck/course_ck4.png", "../../../image/learn/ck/course_ck5.png", "../../../image/learn/ck/course_ck6.png", "../../../image/learn/ck/course_ck7.png"],
    gcImgArr: ["../../../image/learn/gc/course_gc1.png", "../../../image/learn/gc/course_gc2.png", "../../../image/learn/gc/course_gc3.png", "../../../image/learn/gc/course_gc4.png", "../../../image/learn/gc/course_gc5.png"],
    zhImgArr: ["../../../image/learn/zh/course_zh1.png", "../../../image/learn/zh/course_zh2.png", "../../../image/learn/zh/course_zh3.png", "../../../image/learn/zh/course_zh4.png", "../../../image/learn/zh/course_zh5.png", "../../../image/learn/zh/course_zh6.png", "../../../image/learn/zh/course_zh7.png"],
    yyImgArr: ["../../../image/learn/yy/course_yy1.png", "../../../image/learn/yy/course_yy2.png", "../../../image/learn/yy/course_yy3.png", "../../../image/learn/yy/course_yy4.png"],
    xlImgArr: ["../../../image/learn/xl/MBA.png", "../../../image/learn/xl/EMBA.png", "../../../image/learn/xl/MPACC.png", "../../../image/learn/xl/MPA.png"],
    classSelectIndex: 0,
    toView: 'inToView0',
    liveListType: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var liveListType = options.liveListType;
    if (liveListType != undefined) {
      this.setData({ liveListType: liveListType });
    }
    var windowHeight = parseInt(swan.getSystemInfoSync().windowHeight) * 2;
    console.log(swan.getSystemInfoSync().windowWidth / swan.getSystemInfoSync().windowHeight);

    this.setData({
      windowHeight: windowHeight
    });
    this.setData({
      marginBottom: windowHeight * (swan.getSystemInfoSync().windowHeight / swan.getSystemInfoSync().windowWidth)
    });
    // this.getExamCategory();
    this.selectioncenter();
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
  selectioncenter: function (event) {
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
          for (var i = 0; i < data.list.length; i++) {
            for (var j = 0; j < data.list[i].categorylist.length; j++) {
              switch (i) {
                case 0:
                  data.list[i].categorylist[j].image = this.data.jrImgArr[j];
                  break;
                case 1:
                  data.list[i].categorylist[j].image = this.data.ckImgArr[j];
                  break;
                case 2:
                  data.list[i].categorylist[j].image = this.data.gcImgArr[j];
                  break;
                case 3:
                  data.list[i].categorylist[j].image = this.data.xlImgArr[j];
                  break;
                default:
                  break;
              }
            }
          }
          this.setData({ bigclass: data.list });
          if (this.data.liveListType == 1) {
            this.getPublicCourseList();
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
  //获取考试类别
  // getExamCategory: function (event) {
  //   api.getExamCategory({
  //     methods: 'GET',
  //     success: (res) => {
  //       wx.hideToast();
  //       var data = res.data;
  //       console.log(data)
  //       if (data.errcode == 0) {
  //         var bigclass = data.bigclass;
  //         var smallclass;
  //           for (var i = 0; i < bigclass.length; i++) {
  //             bigclass[i].title = decodeURI(bigclass[i].title);
  //             smallclass = bigclass[i].smallclass;
  //             // switch (i) {
  //             //   case 0:
  //             //     bigclass[i].title = '金融类';
  //             //     break;
  //             //   case 1:
  //             //     bigclass[i].title = '财会类';
  //             //     break;
  //             //   case 2:
  //             //     bigclass[i].title = '工程类';
  //             //     break;
  //             //   case 3:
  //             //     bigclass[i].title = '综合类';
  //             //     break;
  //             //   case 4:
  //             //     bigclass[i].title = '医药类';
  //             //     break;
  //             //   default:
  //             //     break;
  //             // }
  //             for (var j = 0; j < smallclass.length; j++) {
  //               smallclass[j].title = decodeURI(smallclass[j].title);
  //               // smallclass[j].shorttitle = j;
  //               smallclass[j].shorttitle = decodeURI(smallclass[j].shorttitle);
  //               switch (i) {
  //                 case 0:
  //                   smallclass[j].image = this.data.jrImgArr[j];
  //                   break;
  //                 case 1:
  //                   smallclass[j].image = this.data.ckImgArr[j];
  //                   break;
  //                 case 2:
  //                   smallclass[j].image = this.data.gcImgArr[j];
  //                   break;
  //                 case 3:
  //                   smallclass[j].image = this.data.zhImgArr[j];
  //                   break;
  //                 case 4:
  //                   smallclass[j].image = this.data.yyImgArr[j];
  //                   break;
  //                 case 5:
  //                   smallclass[j].image = this.data.xlImgArr[j];
  //                   break;
  //                 default:
  //                   break;
  //               }
  //             }
  //           }
  //           // this.setData({ bigclass: bigclass });
  //           if (this.data.liveListType == 1) {
  //             this.getPublicCourseList();
  //           }
  //         //console.log("bigclass: " + decodeURI(data.bigclass[0].title));
  //         //wx.setStorageSync('wx_openid', data.openid)
  //       } else {
  //         swan.showToast({
  //           title: data.errmsg
  //         });
  //       }

  //     }
  //   })
  // },

  getPublicCourseList: function () {
    api.getPublicCourseList({
      methods: 'POST',
      data: {
        from: app.globalData.from
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        console.log(data);
        if (data.errcode == 0) {
          var bigclass = [];
          bigclass = this.data.bigclass;
          var bigclassShow = 0;
          var smallclassShow = 0;
          for (var i = bigclass.length - 1; i >= 0; i--) {
            bigclassShow = 0;
            for (var j = bigclass[i].smallclass.length - 1; j >= 0; j--) {
              smallclassShow = 0;
              for (var k = data.list.length - 1; k >= 0; k--) {
                if (bigclass[i].smallclass[j].id == data.list[k].categoryid) {
                  smallclassShow = 1;
                  bigclassShow = 1;
                }
              }
              if (smallclassShow == 0) {
                bigclass[i].smallclass.splice(j, 1);
              }
            }
            if (bigclassShow == 0) {
              bigclass.splice(i, 1);
            }
          }
          // for (var i = this.data.bigclass.length-1; i >= 0 ; i--){
          //   if (this.data.bigclass[i].smallclass.length < 1){
          //     this.data.bigclass.splice(i, 1);
          //   }
          // }
          this.setData({ bigclass: bigclass });
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
    // var url = '../../me/me';
    // wx.switchTab({
    //   url: url
    // })
  },
  classSwitch: function (event) {
    var index = event.currentTarget.dataset.index;
    this.setData({ classSelectIndex: index });
    this.setData({ toView: 'inToView' + index });
  },
  categoryTap: function (event) {
    swan.setStorageSync('navIndex', 0);
    swan.setStorageSync('categoryNavIndex', 0);
    var index = event.currentTarget.dataset.index;
    var smallindex = event.currentTarget.dataset.smallindex;
    var categorylist = this.data.bigclass[smallindex].categorylist;
    swan.setStorageSync('categoryid', categorylist[index].id);
    swan.setStorageSync('bk_bigclass', this.data.bigclass);
    swan.setStorageSync('bk_smallclass', categorylist);
    swan.setStorageSync('categoryname', categorylist[index].title);

    this.getCourseByCategory(categorylist[index].id);

    // wx.setStorageSync('centerBtnClickIndex', 0);
    // var url = '../../learn/learn';
    // wx.switchTab({
    //   url: url
    // })
    // var smallclassItem = JSON.stringify(smallclass);
    // //选择考试跳转
    // if (this.data.statusType == 0) {
    //   var url = '../changeSubject/changeSubject?smallclassItem=' + smallclassItem;
    //   console.log('url=' + url);
    //   wx.navigateTo({
    //     url: url
    //   });
    // }
    //  var smallclasstemp = JSON.stringify(smallclass);
    //  var url = '../learn?choseCatagoryId=' + smallclass[index].id + "&smallclass=" + smallclasstemp;
    //   wx.navigateTo({
    //     url: url
    //   });
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
        console.log(data);
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
          }
          //选择分类后返回
          var pages = getCurrentPages();
          console.log(pages.length);
          var prevPage;
          if (pages.length > 1) {
            prevPage = pages[pages.length - 2];
            //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
            prevPage.setData({
              switchClassCategory: 1
            });
            swan.navigateBack({
              delta: 1
            });
          } else {
            var url = '../../me/me?refresh=1';
            swan.reLaunch({
              url: url
            });
            // prevPage = pages[pages.length - 1];
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
  classScoll: function (event) {
    var titleHeight = 0;
    var itemHeight = 0;
    let query = swan.createSelectorQuery().in(this);
    query.select('.bigclass_name').boundingClientRect();
    query.select('.category_list_item').boundingClientRect();
    query.exec(res => {
      titleHeight = res[0].height + 15;
      itemHeight = res[1].height + 10;
      console.log(titleHeight + "/" + itemHeight);
      var jrHeight;
      var ckHeight;
      var gcHeight;
      // var zhHeight;
      // var yyHeight;
      var xlHeight;
      for (var i = 0; i < this.data.bigclass.length; i++) {
        if (i == 0) {
          // if (this.data.bigclass[0].id == 1) {
          jrHeight = (parseInt(this.data.bigclass[0].categorylist.length / 2) + this.data.bigclass[0].categorylist.length % 2) * itemHeight + titleHeight;
          // }
        }
        if (i == 1) {
          // if (this.data.bigclass[1].id == 2) {
          ckHeight = (parseInt(this.data.bigclass[1].categorylist.length / 2) + this.data.bigclass[1].categorylist.length % 2) * itemHeight + titleHeight + jrHeight;
          // }
        }
        if (i == 2) {
          // if (this.data.bigclass[2].id == 4) {
          gcHeight = (parseInt(this.data.bigclass[2].categorylist.length / 2) + this.data.bigclass[2].categorylist.length % 2) * itemHeight + titleHeight + ckHeight;
          // }
        }
        if (i == 3) {
          // if (this.data.bigclass[3].id == 6) {
          xlHeight = (parseInt(this.data.bigclass[3].categorylist.length / 2) + this.data.bigclass[3].categorylist.length % 2) * itemHeight + titleHeight + gcHeight;
          // }
        }
        // if (i == 4) {
        //   if (this.data.bigclass[4].id == 7) {
        //     yyHeight = (this.data.bigclass[4].smallclass.length / 2 + this.data.bigclass[4].smallclass.length % 2) * titleHeight + itemHeight + zhHeight;
        //   }
        // }
        // if (i == 5) {
        //   if (this.data.bigclass[5].id == 10) {
        //     xlHeight = (this.data.bigclass[5].smallclass.length / 2 + this.data.bigclass[5].smallclass.length % 2) * titleHeight + itemHeight + yyHeight;
        //   }
        // }
      }
      // (scrollTop - wx.getSystemInfoSync().windowHeight * 2) / 
      var scrollTop = event.detail.scrollTop;
      console.log(swan.getSystemInfoSync().windowHeight);
      console.log(swan.getSystemInfoSync().windowHeight + "/" + scrollTop + "/" + jrHeight + "/" + ckHeight + "/" + gcHeight + "/" + xlHeight);
      this.setData({newxlheight: swan.getSystemInfoSync().windowHeight -10});
      if (scrollTop >= 0 && scrollTop < jrHeight) {
        this.setData({ classSelectIndex: 0 });
      }
      if (scrollTop >= jrHeight && scrollTop < ckHeight) {
        this.setData({ classSelectIndex: 1 });
      }
      if (scrollTop >= ckHeight && scrollTop < gcHeight) {
        this.setData({ classSelectIndex: 2 });
      }
      if (scrollTop >= gcHeight && scrollTop <= xlHeight) {
        this.setData({ classSelectIndex: 3 });
      }
      // if (scrollTop > zhHeight && scrollTop <= yyHeight) {
      //   this.setData({ classSelectIndex: 4 });
      // }
      // if (scrollTop > yyHeight && scrollTop <= xlHeight) {
      //   this.setData({ classSelectIndex: 5 });
      // }
    });
  }
});