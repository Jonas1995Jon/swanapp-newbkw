// pages/me/answerQuestions/addQuestion.js
import api from '../../../api/api.js';
import request from '../../../api/request.js';
import common from '../../../utils/common.js';

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
  data: {
    navigation: {
      leftBtn: 1,
      leftBtnImg: '../../../image/navigation/back.png',
      centerBtn: 0,
      centerBtnTitle: '提问'
    },
    tempFilePaths: '',
    courseid: '',
    coursename: '',
    textareaStr: '',
    imgUrlArr: [],
    hiddenSubmit: 1,
    choiceCourseHidden: true,
    addImgHidden: false,
    imgIndexArr: []
  },

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
    this.setData({ sessionid: sessionid });
    this.setData({ uid: uid });
    var orderid = options.orderid;
    this.setData({ orderid: orderid });
    categoryid = swan.getStorageSync('categoryid');
    courseid = swan.getStorageSync('courseid');
    this.getCourseByCategory();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var coursename = this.data.coursename;
    if (coursename == undefined || coursename == '') {
      coursename = swan.getStorageSync('coursename');
    }
    var courseid = this.data.courseid;
    if (courseid == undefined || courseid == '') {
      courseid = swan.getStorageSync('courseid');
    }
    this.setData({ courseid: courseid });
    this.setData({ coursename: coursename });
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
  onShareAppMessage: function () { },
  bindFormSubmit: function (e) {
    var textarea = e.detail.value.textarea;
    if (textarea.length < 1 || textarea == undefined) {
      swan.showModal({
        title: '提示',
        content: '请输入您的问题描述',
        showCancel: false
      });
    } else {
      swan.showToast({
        title: '问题提交中',
        icon: 'success',
        duration: 1500
      });
      this.setData({ hiddenSubmit: 1 });
      this.setData({ textareaStr: textarea });
      if (this.data.orderid == undefined || this.data.orderid == "") {
        if (this.data.tempFilePaths.length > 0) {
          for (var i = 0; i < this.data.tempFilePaths.length; i++) {
            this.uploadfiletooss(i);
          }
        } else {
          this.addQuestion();
        }
      } else {
        if (this.data.tempFilePaths.length > 0) {
          for (var i = 0; i < this.data.tempFilePaths.length; i++) {
            this.uploadfiletooss(i);
          }
        } else {
          this.webaddConversation();
        }
      }
    }
  },
  // mycourseTap: function () {
  //   var categoryid = wx.getStorageSync('categoryid');
  //   // var smallclass = JSON.parse(wx.getStorageSync('bk_smallclass'));
  //   var smallclass = wx.getStorageSync('bk_smallclass');
  //   var smallclassItem = {};
  //   for (var i = 0; i < smallclass.length; i++){
  //     if (categoryid == smallclass[i].id){
  //       smallclassItem = smallclass[i];
  //     }
  //   }
  //   smallclassItem = JSON.stringify(smallclassItem);
  //   //选择考试跳转
  //   var url = '../../course/changeSubject/changeSubject?smallclassItem=' + smallclassItem + '&flag=addquestion';
  //     wx.navigateTo({
  //       url: url
  //     });
  // },
  //有问必答_新建工单
  addQuestion: function () {
    var categoryid = swan.getStorageSync('categoryid');
    // var courseid = wx.getStorageSync('courseid');
    var courseid = this.data.courseid;
    var textareaStr = this.data.textareaStr;
    var title = textareaStr.substring(0, 20);
    var problem_attachment = '';
    for (var i = 0; i < this.data.imgUrlArr.length; i++) {
      if (i == this.data.imgUrlArr.length - 1) {
        problem_attachment += this.data.imgUrlArr[i];
      } else {
        problem_attachment += this.data.imgUrlArr[i] + "|";
      }
    }
    api.addQuestion({
      methods: 'POST',
      data: {
        sessionid: this.data.sessionid,
        uid: this.data.uid,
        categoryid: categoryid,
        courseid: courseid,
        content: this.data.textareaStr,
        title: title,
        problem_attachment: problem_attachment,
        iswechat: 0
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          var pages = getCurrentPages();
          var prevPage = pages[pages.length - 2];
          // var delta = (this.data.prevPage == 2 ? 2 : 1);
          //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
          prevPage.setData({
            questionSuccess: 1
          });
          swan.navigateBack({
            delta: 1
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
  //有问必答_回复对话
  webaddConversation: function () {
    var reply_attachment = '';
    for (var i = 0; i < this.data.imgUrlArr.length; i++) {
      if (i == this.data.imgUrlArr.length - 1) {
        reply_attachment += this.data.imgUrlArr[i];
      } else {
        reply_attachment += this.data.imgUrlArr[i] + "|";
      }
    }
    api.addConversation({
      methods: 'POST',
      data: {
        sessionid: this.data.sessionid,
        uid: this.data.uid,
        orderid: this.data.orderid,
        content: this.data.textareaStr,
        reply_attachment: reply_attachment
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          var pages = getCurrentPages();
          var prevPage = pages[pages.length - 2];
          // var delta = (this.data.prevPage == 2 ? 2 : 1);
          //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
          prevPage.setData({
            questionContinue: 1
          });
          swan.navigateBack({
            delta: 1
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
  //上传文件
  uploadfiletooss: function (tempFileIndex) {
    var that = this;
    swan.uploadFile({
      url: 'https://api3.cnbkw.com/appad/uploadfiletooss',
      filePath: that.data.tempFilePaths[tempFileIndex],//图片路径，如tempFilePaths[0]
      name: 'image',
      // header: {
      //   "Content-Type": "multipart/form-data",
      //   "fileext":"png"        
      // },
      success: function (res) {
        var data = res.data;
        if (data) {
          console.log(1111 + res.data);
          that.data.imgUrlArr.push(res.data);
          that.setData({ imgUrlArr: that.data.imgUrlArr });
          //imgIndexArr存储图片数组下标，imgIndexArr数组长度等于图片数组长度在保存提问
          that.data.imgIndexArr.push(tempFileIndex);
          // console.log(tempFileIndex)
          // console.log(that.data.imgIndexArr)
          // 此方式不妥，前面图片还未上传完，最后一张图片下标传过来之后，图片未全部上传完毕就先保存了提问
          // if (tempFileIndex == that.data.tempFilePaths.length-1){
          //   if (that.data.orderid == undefined || that.data.orderid == ""){
          //     that.addQuestion();
          //   }else{
          //     that.webaddConversation();
          //   }
          // }
          if (that.data.imgIndexArr.length == that.data.tempFilePaths.length) {
            if (that.data.orderid == undefined || that.data.orderid == "") {
              that.addQuestion();
            } else {
              that.webaddConversation();
            }
          }
        }
      },
      fail: function (res) {
        console.log(res);
      },
      complete: function (res) { }
    });
  },
  chooseImageTap: function () {
    var that = this;
    var imgArr = this.data.tempFilePaths;
    if (imgArr.length >= 9) {
      swan.showModal({
        title: '温馨提示',
        content: '上传图片数量最多支持9张',
        confirmText: "确定",
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            return;
          } else {
            return;
          }
        }
      });
    } else {
      swan.showActionSheet({
        itemList: ['从相册中选择', '拍照'],
        itemColor: "#f7982a",
        success: function (res) {
          if (!res.cancel) {
            if (res.tapIndex == 0) {
              that.chooseWxImage('album');
            } else if (res.tapIndex == 1) {
              that.chooseWxImage('camera');
            }
          }
        }
      });
    }
  },
  chooseWxImage: function (type) {
    var that = this;
    swan.chooseImage({
      count: 9, // 默认9
      sizeType: ['original', 'compressed'],
      sourceType: [type],
      success: function (res) {
        var imgArr = that.data.tempFilePaths;
        if (imgArr.length > 0) {
          if (res.tempFilePaths.length > 0) {
            for (var i = 0; i < res.tempFilePaths.length; i++) {
              imgArr.push(res.tempFilePaths[i]);
            }
          } else {
            imgArr.push(res.tempFilePaths);
          }
          if (imgArr.length >= 9) {
            that.setData({ addImgHidden: true });
          }
          if (imgArr.length > 9) {
            let imgs = imgArr.length - 9;
            for (let i = 0; i < imgs; i++) {
              imgArr.pop();
            }
            swan.showToast({
              title: '最多上传九张',
              icon: 'success',
              duration: 2500
            });
          }
          that.setData({
            tempFilePaths: imgArr
          });
        } else {
          that.setData({
            tempFilePaths: res.tempFilePaths
          });
          // var base64url = that.getBase64Image(res.tempFilePaths);
          // console.log(base64url);
        }
      }
    });
  },
  delImageTap: function (event) {
    var index = event.currentTarget.dataset.index;
    var imgArr = this.data.tempFilePaths;
    imgArr.splice(index, 1);
    this.setData({
      tempFilePaths: imgArr
    });
  },
  leftBtnClick: function () {
    swan.navigateBack({});
  },
  courseActionSheetTap: function () {
    this.setData({
      choiceCourseHidden: !this.data.choiceCourseHidden
    });
  },
  courseChoiceTap: function (event) {
    var index = event.currentTarget.dataset.index;
    var courseid = event.currentTarget.dataset.courseid;
    // this.setData({
    //   courseid: courseid
    // })

    if (this.data.courselist[index].selected == 0) {
      this.data.courselist[index].selected = 1;
      // this.setData({
      //   coursename: this.data.courselist[index].title,
      // })
      for (var i = 0; i < this.data.courselist.length; i++) {
        if (i != index) {
          this.data.courselist[i].selected = 0;
        }
      }
    } else {
      return;
    }
    this.setData({ courselist: this.data.courselist });
  },
  sureChoiceTap: function (event) {
    this.setData({
      choiceCourseHidden: !this.data.choiceCourseHidden
    });
    for (var i = 0; i < this.data.courselist.length; i++) {
      if (this.data.courselist[i].selected == 1) {
        this.setData({
          courseid: this.data.courselist[i].id,
          coursename: this.data.courselist[i].title
        });
      }
    }
  },
  //获取考试类别
  getCourseByCategory: function (event) {
    var that = this;
    api.getCourseByCategory({
      methods: 'POST',
      data: {
        categoryid: categoryid
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
            if (courselist[i].id == courseid) {
              courselist[i].selected = 1;
            } else {
              courselist[i].selected = 0;
            }
          }
          this.setData({ courselist: courselist });
          var courselist = JSON.stringify(courselist);
          // console.log(courselist)
          swan.setStorageSync('bk_courselist', courselist);
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
  actionSheetbindchange1: function () {
    this.setData({
      choiceCourseHidden: !this.data.choiceCourseHidden
    });
    for (var i = 0; i < this.data.courselist.length; i++) {
      if (this.data.courselist[i].id == this.data.courseid) {
        this.data.courselist[i].selected = 1;
      } else {
        this.data.courselist[i].selected = 0;
      }
    }
    this.setData({ courselist: this.data.courselist });
  },
  hideMasking() {
    this.setData({
      choiceCourseHidden: true
    });
  }
});