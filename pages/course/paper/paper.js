// pages/course/paper/studyPage.js

import api from '../../../api/api.js';
import request from '../../../api/request.js';
import common from '../../../utils/common.js';
var DOMParser = require('../../../utils/xmldom/dom-parser').DOMParser;
var XMLSerializer = require('../../../utils/xmldom/dom-parser').XMLSerializer;
var WxParse = require('../../../utils/wxParse/wxParse.js');
//获取应用实例
var app = getApp();

var interval = null; //记录作答时间定时器
var onlineTimer = null; //检测是否同时在线定时器
var logsTimer = null; //日志记录定时器
var beginPagex = 0; //滑动开始的paperindex
var checkboxIsSubmit = false; //多选按钮是否允许提交

//获取用户信息
var bk_userinfo = swan.getStorageSync('bk_userinfo');
var sessionid = app.globalData.default_sessionid;
var uid = app.globalData.default_uid;
if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
  sessionid = bk_userinfo.sessionid;
  uid = bk_userinfo.uid;
}
//课程ID
var courseid = swan.getStorageSync('courseid');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    navigation: {
      leftBtn: 1,
      leftBtnImg: '../../../image/navigation/back.png',
      centerBtn: 0,
      centerBtnTitle: '智能刷题'
    },
    QId: '', //QId
    QGuid: '', //QGuid
    unitid: '', //章节ID
    paperid: '', //试卷ID
    learnType: '', //学习类型

    time: 0, //计时
    wastetime: 0, //当前试题用时
    displayTime: '00:00', //计时器时间
    paperTitleStr: '', //标题
    paperindex: 0, //当前页码
    papercount: '', //总共页码
    quetypename: '', //题型类型名称
    quetitle: '', //标题
    Explanation: '', //解析
    quetype: '', //题型类型

    dispalyExplanation: 0, //是否显示解析
    clientHeight: 0, //系统高度
    clientWidth: 0, //系统宽度
    showPerfectAccount: 0, //是否显示完善账户
    submitPaperBtnHidden: false, //交卷按钮是否显示
    parsingType: '', //0错题解析、1全部解析
    isAnswer: 1, //是否支持作答
    history: 0, //是否为历史学习记录

    question: '', //题型列表
    OptionList: '' //题目正确选项 
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 是否显示完善账户信息
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    if (bk_userinfo == undefined || bk_userinfo == null || bk_userinfo == '') {
      this.setData({ showPerfectAccount: 1 });
    }

    //获取系统分辨率
    var that = this;
    swan.getSystemInfo({
      success: function (res) {
        var clientHeight = res.windowHeight;
        var clientWidth = res.windowWidth;
        that.setData({
          clientWidth: clientWidth,
          clientHeight: clientHeight
        });
      }
    });

    var paperTitle = options.paperTitle;
    if (paperTitle != undefined) {
      this.setData({ paperTitleStr: paperTitle });
    }

    var paperid = options.paperid;
    if (paperid != undefined) {
      this.setData({ paperid: paperid });
    }

    var learnType = options.learnType;
    if (learnType != undefined) {
      this.setData({ learnType: learnType });
    }

    var history = options.history;
    if (history != undefined) {
      this.setData({ history: history });
    }

    /*********************************⚠️️️️️巨坑*********************************/
    /**********decodeURI模拟器报错，真机正常，真机测试、上线需放开相应代码***********/
    var question = options.question;
    // var question = decodeURI(options.question);
    /*********************************⚠️️️️️巨坑*********************************/
    question = JSON.parse(question);
    this.setData({ question: question });

    var unitid = options.unitid;
    if (unitid == undefined) {
      unitid = this.data.question.unitid;
    }
    this.setData({ unitid: unitid });

    this.setData({ quetypename: question.list[0].quetypename });
    this.setData({ papercount: question.list.length });

    var questionList = question.list;
    // var parentqid;
    // for (var i = 0; i < questionList.length; i++) {
    //   parentqid = questionList[i].parentqid;
    //   if (parentqid.length > 0){
    //     // 有父节点的情况
    //   }else{
    //     // 无父节点的情况
    //   }
    // }
    // var answerArr = [];
    for (var i = 0; i < questionList.length; i++) {
      var data = {
        useranswer: '', //单选选项
        useranswerId: '', //单选选项id
        useranswerIndex: '', //单选index
        useranswerArr: [], //多选选项
        useranswerIdArr: [], //多选选项id
        useranswerIndexArr: [], //多选index
        answer: '', //正确答案选项
        answerId: questionList[i].answer, //正确答案选项id
        extent: '', //难易程度
        stem: '', //题干
        score: questionList[i].score, //分值
        enginnemode: questionList[i].enginnemode, //提醒类型
        isright: questionList[i].isright, //正确与否
        qid: questionList[i].qid, //qid
        answered: 0, //是否已经作答0否1是
        showExplanation: 0, //是否显示解析
        optionArr: [], //当前选项集合
        knowledgepoint: '', //知识点集合
        checkboxBtnShow: false //多选题提交后隐藏按钮

        // answerArr.push(data);
      };this.data.question.list[i]['answerCustom'] = data;
      // this.data.answerArr.push(data);
    }

    /*是否是历史记录进入*/
    if (history == 1) {
      //history 1历史记录 2解析
      var lastqid = this.data.question.lastqid - 1;
      this.loadquestion(lastqid, 1);
      this.setData({ paperindex: lastqid });
    } else {
      //解析或初始化加载试卷
      var paperindex = this.data.paperindex;
      this.loadquestion(paperindex, 1);
    }

    /*是否是解析进入*/
    if (options.parsingType == 1 || options.parsingType == 2) {
      // 解析停止计时
      this.setData({ parsingType: options.parsingType });
      this.onStopHandler();
      this.onlineTimerStopHandler();
      this.logsTimerStopHandler();
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
    //交卷后不在扣学时
    if (this.data.isAnswer == 1 && this.data.parsingType != 1 && this.data.parsingType != 2) {
      this.onStartHandler(); //计时开始
      this.onlineTimerHandler(); //扣除学时，检查是否同时在线登录
      this.logsTimerHandler(); //刷题日志记录
    }

    // var paperindex = this.data.paperindex;
    // console.log(this.data.parsingType);
    // //全部解析
    // if (this.data.parsingType == 1) {
    //   for (var i = 0; i < this.data.question.list.lengthgth; i++) {
    //     this.data.answerArr[i].showExplanation = 1;
    //   }
    //   this.data.question.list[paperindex].answerCustom.showExplanation = 1;
    //   this.setData({ answerArr: this.data.answerArr });
    //   this.setData({ isAnswer: 0 });
    //   return;
    // }
    // // 错题解析
    // if (this.data.parsingType == 2) {
    //   for (var i = this.data.question.list.lengthgth - 1; i >= 0; i--) {
    //     this.data.answerArr[i].showExplanation = 1;
    //     if (this.data.answerArr[i].isright == 1) {
    //       var qid = this.data.answerArr[i].qid;
    //       this.data.answerArr.splice(i, 1);
    //       for (var j = this.data.question.list.length - 1; j >= 0; j--) {
    //         if (qid == this.data.question.list[j].qid) {
    //           this.data.question.list.splice(j, 1);
    //         }
    //       }
    //     }
    //   }
    //   this.data.question.list[paperindex].answerCustom.showExplanation = 1;
    //   this.setData({ question: this.data.question });
    //   this.setData({ papercount: this.data.question.list.length });
    //   this.setData({ answerArr: this.data.answerArr });
    //   this.setData({ isAnswer: 0 });
    // }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.onStopHandler(); //停止计时
    this.onlineTimerStopHandler();
    this.logsTimerStopHandler();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.onStopHandler(); //停止计时
    this.onlineTimerStopHandler();
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
  onShareAppMessage: function () {},
  loadquestion: function (paperindex, isparsecontent) {
    var unitid = this.data.unitid;
    var paperid = this.data.paperid;
    var questionList = this.data.question.list;
    if (questionList.length < 1 || paperindex >= questionList.length) {
      return;
    }
    var qid = questionList[paperindex].qid;
    api.loadquestion({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        unitid: unitid,
        paperid: paperid,
        qid: qid,
        videosource: getApp().globalData.videosource
      },
      success: res => {
        var data = res.data;
        //解析content xml 默认解析第0个
        // var mainqueArr = this.data.mainqueArr;
        if (data.errcode == 0) {
          //请求成功读取试题-v2.3
          //防止向mainqueArr数组里重复添加数据
          // console.log(questionList[paperindex].mainque);
          if (questionList[paperindex].mainque != undefined) {
            var isExist = false;
            for (var i = 0; i < questionList.length; i++) {
              if (data.mainque[0].qid == questionList[i].mainque.qid) {
                isExist = true;
              }
            }
            if (!isExist) {
              questionList[paperindex].mainque = data.mainque[0];
              this.setData({ question: this.data.question });
              // this.paserRightAnswer();
            }
          } else {
            // mainque为空先生成与list匹配的个数
            for (var i = 0; i < this.data.question.list.length; i++) {
              this.data.question.list[i]['mainque'] = {};
            }
            this.data.question.list[paperindex].mainque = data.mainque[0];
            this.setData({ question: this.data.question });
            // this.paserRightAnswer();
          }

          //isparsecontent等于1解析congtent
          if (isparsecontent == 1) {
            this.parsecontent(this.data.paperindex);
          }
        } else if (data.errcode == 40036) {
          //请先购买课程
          common.showToast({
            title: data.errmsg,
            icon: 'success',
            duration: 1500
          });
        } else if (data.errcode == 40052) {
          //未找到会话信息，请重新登录
          common.showToast({
            title: data.errmsg,
            icon: 'success',
            duration: 1500
          });
          //request_thirdauth();
        } else {
          common.showToast({
            title: data.errmsg,
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  },
  //解析content内容
  parsecontent: function (paperindex) {
    var mainque = this.data.question.list[paperindex].mainque;
    // console.log('mainque=' + mainque);
    //滑动快了，有请求获取失败的情况，继续请求解析，比较暴力
    if (mainque == undefined || mainque.qid == undefined) {
      this.loadquestion(paperindex, 1);
      return;
    }
    /**解析xml for content begin */
    var doc = new DOMParser().parseFromString(mainque.content);
    var Title = doc.getElementsByTagName("Title")[0];
    var QId = doc.getElementsByTagName("QId")[0];
    var QGuid = doc.getElementsByTagName("QGuid")[0];
    var Type = doc.getElementsByTagName("Type")[0];
    var Stem = doc.getElementsByTagName("Stem")[0];
    var OptionList = doc.getElementsByTagName("OptionList")[0];
    var Extent = doc.getElementsByTagName("Extent")[0];
    var ThisType = doc.getElementsByTagName("ThisType")[0];
    var PageCode = doc.getElementsByTagName("PageCode")[0];
    var Explanation = doc.getElementsByTagName("Explanation")[0];
    var Option = doc.getElementsByTagName("Option")[0];

    var element;
    //必须判断长度，不判断为空时会崩溃
    //QId
    if (QId.childNodes.length > 0) {
      element = QId.firstChild.nodeValue;
      this.setData({ QId: element });
    }
    //QGuid
    if (QGuid.childNodes.length > 0) {
      element = QGuid.firstChild.nodeValue;
      this.setData({ QGuid: element });
    }
    //Type
    if (Type.childNodes.length > 0) {
      element = Type.firstChild.nodeValue;
      this.setData({ quetype: element });
    }
    //标题
    if (Title.childNodes.length > 0) {
      element = Title.firstChild.nodeValue;
      // element = common.convertHTMLToString(Title.firstChild.nodeValue);
      this.setData({ quetitle: element });
    }
    //正确选项
    if (OptionList.childNodes.length > 0) {
      element = OptionList.firstChild.nodeValue;
      this.setData({ OptionList: element });
    }
    //解析
    if (Explanation.childNodes.length > 0) {
      element = Explanation.firstChild.nodeValue;
      // element = common.convertHTMLToString(Explanation.firstChild.nodeValue);
      this.setData({ Explanation: element });
    }
    //难易程度
    if (Extent.childNodes.length > 0) {
      element = Extent.firstChild.nodeValue;

      this.data.question.list[paperindex].answerCustom.extent = element;
    }

    //题干
    if (Stem.childNodes.length > 0) {
      element = Stem.firstChild.nodeValue;
      this.data.question.list[paperindex].answerCustom.stem = element;
      WxParse.wxParse('paperStem', 'html', this.data.stem, this, 5);
    }
    /**解析xml for content end */

    //组装选项
    if (Option.childNodes.length > 0) {
      var optionArr = common.splitToArray(Option.firstChild.nodeValue, "|b#k*w|");
      var optionIdArr = common.splitToArray(Option.attributes.getNamedItem("ID").nodeValue, "|");
      var tempArr = [];
      var data;
      var optionChecked = 0;
      for (var i = 0; i < optionArr.length; i++) {
        // 选中状态
        if (this.data.question.list[paperindex].answerCustom.optionArr.length > 0) {
          optionChecked = this.data.question.list[paperindex].answerCustom.optionArr[i].optionChecked;
        }
        switch (i) {
          case 0:
            data = {
              option: 'A',
              optionId: optionIdArr[i],
              optionTitle: optionArr[i],
              optionChecked: optionChecked
            };
            WxParse.wxParse('paperTitle' + [i], 'html', optionArr[i], this, 5);
            break;
          case 1:
            data = {
              option: 'B',
              optionId: optionIdArr[i],
              optionTitle: optionArr[i],
              optionChecked: optionChecked
            };
            WxParse.wxParse('paperTitle' + [i], 'html', optionArr[i], this, 5);
            break;
          case 2:
            data = {
              option: 'C',
              optionId: optionIdArr[i],
              optionTitle: optionArr[i],
              optionChecked: optionChecked
            };
            WxParse.wxParse('paperTitle' + [i], 'html', optionArr[i], this, 5);
            break;
          case 3:
            data = {
              option: 'D',
              optionId: optionIdArr[i],
              optionTitle: optionArr[i],
              optionChecked: optionChecked
            };
            WxParse.wxParse('paperTitle' + [i], 'html', optionArr[i], this, 5);
            break;
          case 4:
            data = {
              option: 'E',
              optionId: optionIdArr[i],
              optionTitle: optionArr[i],
              optionChecked: optionChecked
            };
            WxParse.wxParse('paperTitle' + [i], 'html', optionArr[i], this, 5);
            break;
          case 5:
            data = {
              option: 'F',
              optionId: optionIdArr[i],
              optionTitle: optionArr[i],
              optionChecked: optionChecked
            };
            WxParse.wxParse('paperTitle' + [i], 'html', optionArr[i], this, 5);
            break;
          case 6:
            data = {
              option: 'G',
              optionId: optionIdArr[i],
              optionTitle: optionArr[i],
              optionChecked: optionChecked
            };
            WxParse.wxParse('paperTitle' + [i], 'html', optionArr[i], this, 5);
            break;
          default:
            break;
        }
        tempArr.push(data);
      }
      this.data.question.list[paperindex].answerCustom.optionArr = tempArr;
      this.data.question.list[paperindex].answerCustom.knowledgepoint = mainque.zhishidian[0];
    }

    WxParse.wxParse('paperTitle', 'html', this.data.quetitle, this, 5);
    WxParse.wxParse('Explanation', 'html', this.data.Explanation, this, 5);

    //历史记录进入单独组装数据方式
    if (this.data.history == 1 || this.data.history == 2) {
      var question = this.data.question.list[paperindex];
      if (question.useranswer.length > 0) {
        this.data.question.list[paperindex].answerCustom.answered = 1; //已作答
        this.data.question.list[paperindex].answerCustom.showExplanation = 1; //显示解析
        this.data.question.list[paperindex].answerCustom.isright = question.isright; //回答正确
        this.data.question.list[paperindex].answerCustom.score = question.score;
        this.setData({ isAnswer: 1 });
        //单选
        if (question.enginemode == 1 || question.enginemode == 3) {
          this.data.question.list[paperindex].answerCustom.useranswerId = question.useranswer; //选项ID
          for (var i = 0; i < this.data.question.list[paperindex].answerCustom.optionArr.length; i++) {
            if (question.useranswer == this.data.question.list[paperindex].answerCustom.optionArr[i].optionId) {
              this.data.question.list[paperindex].answerCustom.optionArr[i].optionChecked = 1;
              this.data.question.list[paperindex].answerCustom.useranswer = this.data.question.list[paperindex].answerCustom.optionArr[i].option; //选项
            }
          }
        }
        if (question.enginemode == 2) {
          this.data.question.list[paperindex].answerCustom.useranswerIdArr = question.useranswer.replace("%2c"); //选项ID
          var answerTitleArr = [];
          var answerIdArr = common.splitToArray(question.useranswer, "%2c");
          var optionid;
          var optiontitle;
          //组装用户作答答案
          for (var i = 0; i < this.data.question.list[paperindex].answerCustom.optionArr.length; i++) {
            optionid = this.data.question.list[paperindex].answerCustom.optionArr[i].optionId;
            optiontitle = this.data.question.list[paperindex].answerCustom.optionArr[i].option;
            for (var j = 0; j < answerIdArr.length; j++) {
              if (optionid == answerIdArr[j]) {
                this.data.question.list[paperindex].answerCustom.optionArr[i].optionChecked = 1;
                answerTitleArr.push(optiontitle);
              }
            }
          }
          this.data.question.list[paperindex].answerCustom.useranswerArr = answerTitleArr.toString();
        }
      }
      if (this.data.history == 2) {
        for (var i = 0; i < this.data.question.list.length; i++) {
          this.data.question.list[i].answerCustom.showExplanation = 1; //显示解析
        }
        this.data.question.list[paperindex].answerCustom.showExplanation = 1;
        this.setData({ isAnswer: 0 }); //是否作答
      }
    }
    // 解析历史记录都需单独组装一次正确答案
    this.paserRightAnswer(paperindex);
  },
  //做题计时器
  onStartHandler: function () {
    if (!interval) {
      interval = setInterval(() => {

        this.setData({ time: this.data.time + 1 });
        this.setData({ displayTime: this.parseTime(this.data.time) });
        //console.log('计时开始' + this.data.displayTime);
      }, 1000);
    }
  },
  //刷题记录日志定时器
  logsTimerHandler: function () {
    var nowDate = new Date();
    var addtime = common.formatTime(nowDate);
    var model;
    var os;
    var resolution;
    var that = this;
    swan.getSystemInfo({
      success: function (res) {
        model = res.model;
        os = res.system;
        resolution = res.windowWidth + '*' + res.windowHeight;
      }
    });
    var pageid = common.randomString(32);
    if (!logsTimer) {
      logsTimer = setInterval(function () {
        var data = {
          action: 'shuati',
          module: that.data.learnType,
          courseid: courseid,
          unitid: that.data.unitid,
          paperid: that.data.paperid,
          questionid: that.data.QId,
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
        };if (that.data.learnType == undefined || that.data.unitid == undefined || that.data.paperid == undefined || that.data.QI == undefined) {
          return;
        }
        request.request_collectLog(data);
      }, 10000);
    }
  },
  //扣除学时、判断是否同时在线学习定时器
  onlineTimerHandler: function () {
    if (!onlineTimer) {
      onlineTimer = setInterval(() => {
        this.setremainder();
        this.setonline();
      }, 60000);
    }
  },
  //扣除学时
  setremainder: function () {
    api.setremainder({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        type: this.data.learnType,
        times: 60,
        market: app.globalData.market
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          //不处理
        } else if (data.errcode == -1) {
          //60分钟免费试用时间已经用完,无法继续观看！
          this.onlineTimerStopHandler(); //停止扣学时
          swan.showModal({
            title: '温馨提示',
            content: data.errmsg,
            confirmText: "立即购买",
            cancelText: "残忍拒绝",
            success: function (res) {
              if (res.confirm) {
                swan.navigateTo({
                  url: '../../buyCourseNew'
                });
              } else {
                var pages = getCurrentPages();
                var num = pages.length;
                swan.navigateBack({
                  delta: num
                });
              }
            }
          });
        } else if (data.errcode == -2) {
          //您的学时已经用完，无法继续学习，请联系学习顾问加时！
          this.onlineTimerStopHandler(); //停止扣学时
          swan.showModal({
            title: '温馨提示',
            content: data.errmsg,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                var pages = getCurrentPages();
                var num = pages.length;
                swan.navigateBack({
                  delta: num
                });
              }
            }
          });
        }
      }
    });
  },
  //判断是否同时在线学习
  setonline: function () {
    api.setonline({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        type: this.data.learnType
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          //
        } else if (data.errcode == 40057) {
          //您的账号在其他地方登录学习，您将被迫退出
          this.onlineTimerStopHandler(); //停止扣学时
          swan.showModal({
            title: '温馨提示',
            content: data.errmsg,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                var pages = getCurrentPages();
                var num = pages.length;
                swan.navigateBack({
                  delta: num
                });
              }
            }
          });
        }
      }
    });
  },
  parseTime: function () {
    var hh = parseInt(this.data.time / 60 / 60);
    if (hh < 10) hh = '0' + hh;

    var mm = parseInt(this.data.time / 60 % 60);
    if (mm < 10) mm = '0' + mm;
    var ss = parseInt(this.data.time % 60);
    if (ss < 10) ss = '0' + ss;
    // var ssss = parseInt(this.data.time % 100);
    // if(ssss<10) ssss = '0'+ssss;
    // return `${mm}:${ss}:${ssss}`
    if (hh > 0) {
      return `${hh}:${mm}:${ss}`;
    }
    return `${mm}:${ss}`;
  },

  onStopHandler: function () {
    console.log('stop');
    if (interval) {
      clearInterval(interval);
      interval = null;
    } else {
      this.setData({
        time: 0,
        displayTime: '00:00'
      });
    }
  },
  logsTimerStopHandler: function () {
    console.log('logsTimer stop');
    if (logsTimer) {
      clearInterval(logsTimer);
      logsTimer = null;
    }
  },
  onlineTimerStopHandler: function () {
    console.log('onlineTimer stop');
    if (onlineTimer) {
      clearInterval(onlineTimer);
      onlineTimer = null;
    }
  },
  //swiper滑动
  handleChange: function (e) {
    var current = e.detail.current;
    this.setData({ quetypename: this.data.question.list[current].quetypename });
    var clientWidth = this.data.clientWidth;
    // console.log('current' + current + '' + this.data.paperindex);
    //试题数组中获取为空逻辑操作
    this.parsecontent(current);
    if (current < this.data.question.list.length - 1) {
      if (this.data.question.list[current + 1].mainque == undefined) {
        this.loadquestion(current + 1, 0);
      }
      if (this.data.question.list[current - 1].mainque == undefined) {
        this.loadquestion(current - 1, 0);
      }
    }
    // this.loadquestion(current + 1, 0)
    this.setData({ paperindex: current });
    checkboxIsSubmit = false;
  },
  //单选选中事件，已选中再次点击无效
  radioChange: function (e) {
    if (this.data.isAnswer == 0) {
      return; //不支持作答
    }
    //单选默认先清空已经选中的情况
    var paperindex = this.data.paperindex;
    for (var i = 0; i < this.data.question.list[paperindex].answerCustom.optionArr.length; i++) {
      if (this.data.question.list[paperindex].answerCustom.optionArr[i].optionChecked = 1) {
        this.data.question.list[paperindex].answerCustom.optionArr[i].optionChecked = 0;
      }
    }
    var answerIndex = e.currentTarget.dataset.hi;
    var optionArr = common.splitToArray(e.detail.value, "|");
    this.data.question.list[answerIndex].answerCustom.useranswerIndex = optionArr[0]; //answerIndex
    this.data.question.list[answerIndex].answerCustom.useranswer = optionArr[1]; //选项
    this.data.question.list[answerIndex].answerCustom.useranswerId = optionArr[2]; //选项ID
    this.data.question.list[answerIndex].answerCustom.answered = 1; //已作答
    var isSubmitAnswer = false;
    if (this.data.learnType == 5 || this.data.learnType == 6) {
      isSubmitAnswer = false;
    } else {
      isSubmitAnswer = true;
      this.data.question.list[answerIndex].answerCustom.showExplanation = 1; //显示解析
    }

    if (this.data.question.list[answerIndex].answerCustom.useranswerId == this.data.question.list[answerIndex].answerCustom.answerId) {
      this.data.question.list[answerIndex].answerCustom.isright = 1; //回答正确
      this.data.question.list[answerIndex].answerCustom.score = this.data.question.list[paperindex].mainque.fenzhi;
    } else {
      this.data.question.list[answerIndex].answerCustom.isright = 2; //回答错误
      this.data.question.list[answerIndex].answerCustom.score = 0;
    }
    var optionIndex = optionArr[0];
    this.data.question.list[answerIndex].answerCustom.optionArr[optionIndex].optionChecked = 1;
    this.setData({ question: this.data.question });

    // if (isSubmitAnswer == true){
    this.saveAnswerInfo(1);
    // }
  },
  //多选选中事件
  checkboxChange: function (e) {
    if (this.data.isAnswer == 0) {
      return; //不支持作答
    }
    //多选默认先清空已经选中的情况
    var paperindex = this.data.paperindex;
    for (var i = 0; i < this.data.question.list[paperindex].answerCustom.optionArr.length; i++) {
      this.data.question.list[paperindex].answerCustom.optionArr[i].optionChecked = 0;
    }
    var answerIndex = e.currentTarget.dataset.hi;
    var option = e.detail.value;
    var optionArr = [];
    var useranswerIndexArr = [];
    var useranswerArr = [];
    var useranswerIdArr = [];
    for (var i = 0; i < option.length; i++) {
      optionArr.push(common.splitToArray(option[i], "|"));
      useranswerIndexArr.push(optionArr[i][0]);
      useranswerArr.push(optionArr[i][1]);
      useranswerIdArr.push(optionArr[i][2]);
      var optionIndex = optionArr[i][0];
      this.data.question.list[answerIndex].answerCustom.optionArr[optionIndex].optionChecked = 1;
    }
    this.data.question.list[answerIndex].answerCustom.useranswerIndexArr = useranswerIndexArr;
    this.data.question.list[answerIndex].answerCustom.useranswerArr = useranswerArr.sort();
    this.data.question.list[answerIndex].answerCustom.useranswerIdArr = useranswerIdArr.sort();
    if (option.length > 0) {
      this.data.question.list[answerIndex].answerCustom.answered = 1; //已作答
    } else {
      this.data.question.list[answerIndex].answerCustom.answered = 0; //未作答
    }
    if (this.data.question.list[answerIndex].answerCustom.useranswerIdArr.toString() == this.data.question.list[answerIndex].answerCustom.answerId) {
      this.data.question.list[answerIndex].answerCustom.isright = 1; //回答正确
    } else {
      this.data.question.list[answerIndex].answerCustom.isright = 2; //回答错误
    }

    this.setData({ question: this.data.question });

    if (checkboxIsSubmit == true) {
      this.saveAnswerInfo(2);
    }
  },
  //多选提交按钮
  checkboxSubmit: function (e) {
    if (this.data.isAnswer == 0) {
      return; //不支持作答
    }
    var paperindex = this.data.paperindex;
    if (this.data.learnType == 5 || this.data.learnType == 6) {
      isSubmitAnswer = false;
    } else {
      isSubmitAnswer = true;
      this.data.question.list[paperindex].answerCustom.showExplanation = 1;
    }

    this.data.question.list[paperindex].answerCustom.checkboxBtnShow = true;
    this.setData({ question: this.data.question });
    this.saveAnswerInfo(2);
    checkboxIsSubmit = true;
  },
  //点击答案解析
  answerExplanation: function () {
    var paperindex = this.data.paperindex;
    // console.log(paperindex);
    this.data.question.list[paperindex].answerCustom.showExplanation = 1;
    this.setData({ question: this.data.question });
  },
  handlerStart: function (e) {
    var pageX = e.changedTouches[0].pageX;
    if (this.data.paperindex == this.data.papercount - 1) {
      beginPagex = pageX;
    }
  },
  // handlerMove: function (e) {
  //   console.log(e);
  // },
  // handlerCancel: function (e) {
  //   console.log(e);
  // },
  handlerEnd: function (e) {
    //解析不在响应事件跳转
    if (this.data.history == 2) {
      return;
    }
    var pageX = e.changedTouches[0].pageX;
    //滑动到最后页显示答题卡
    if (this.data.paperindex == this.data.papercount - 1 && beginPagex - pageX > 70) {
      var state = 1; //是否已做完试题
      var scoreTotal = 0;
      var rightScoreTotal = 0;
      for (var i = 0; i < this.data.question.list.length; i++) {
        scoreTotal = scoreTotal + parseInt(this.data.question.list[i].mainque.fenzhi);
      }
      for (var i = 0; i < this.data.question.list.lengthgth; i++) {
        rightScoreTotal = rightScoreTotal + parseInt(this.data.question.list[i].answerCustom.score);
        if (this.data.question.list[i].answerCustom.answered == 0) {
          state = 0;
        }
      }
      var accuracy = rightScoreTotal / scoreTotal * 100; //提交正确率（当前得分 / 试卷总分
      var submitPaperBtnHidden = this.data.submitPaperBtnHidden;
      var url;
      //交卷后直接显示答题报告
      if (submitPaperBtnHidden == false || submitPaperBtnHidden == "false") {
        url = '../answerCard/answerCard?answerArr=' + JSON.stringify(this.data.answerArr) + '&paperid=' + this.data.question.paperid + '&state=' + state + '&accuracy=' + accuracy + '&submitPaperBtnHidden=' + this.data.submitPaperBtnHidden + '&unitid=' + this.data.unitid + '&learnType=' + this.data.type + '&paperTitle=' + this.data.paperTitleStr;
      } else {
        //显示答题卡
        url = '../report/report?paperid=' + this.data.question.paperid + '&prevPage=2';
      }
      // console.log('url=' + url);
      swan.navigateTo({
        url: encodeURI(url)
      });
    }
  },
  //保存试题答案
  saveAnswerInfo: function (enginemode) {
    //提交答案组装数据 区分单选多选
    var paperindex = this.data.paperindex;
    var question = this.data.question;
    var answer = this.data.question.list[paperindex].answerCustom;
    var accuracy = 0;
    if (answer.isright == 1) {
      accuracy = 1 / question.list.length * 100;
    }
    var rightnum = 0;
    var wrongnum = 0;
    for (var i = 0; i < this.data.question.list.lengthgth; i++) {
      if (this.data.question.list[i].answerCustom.answered == 1 && this.data.question.list[i].answerCustom.isright == 1) {
        rightnum++;
      } else if (this.data.question.list[i].answerCustom.answered == 1 && this.data.question.list[i].answerCustom.isright == 2) {
        wrongnum++;
      }
    }
    var time = this.data.time;
    var wastetime = time - this.data.wastetime;
    this.setData({ wastetime: wastetime });
    var useranswer;
    var letter;
    if (enginemode == 1) {
      useranswer = answer.useranswerId;
      letter = answer.answer;
    } else if (enginemode == 2) {
      useranswer = answer.useranswerIdArr.toString();
      letter = answer.answer;
    }

    var data = {
      unitid: this.data.unitid,
      paperid: this.data.paperid,
      qid: this.data.QId,
      wastetime: wastetime,
      useranswer: useranswer,
      letter: letter,
      isright: answer.isright,
      score: answer.score,
      rightnum: rightnum,
      wrongnum: wrongnum,
      accuracy: accuracy + '%',
      totalwastetime: time,
      kaoqi: question.kaoqi,
      type: this.data.learnType,
      suff: question.suff,
      lastqid: paperindex
    };
    request.request_saveAnswerInfo(data);
  },
  //组装正确答案
  paserRightAnswer: function (paperindex) {
    var paperindex = paperindex;
    if (this.data.question.list[paperindex].mainque.enginemode == 1 || this.data.question.list[paperindex].mainque[paperindex].enginemode == 3) {
      //遍历单选、判断正确答案
      var answerTitle;
      var answerId = this.data.question.list[paperindex].answerCustom.answerId;
      var optionid;
      var optiontitle;
      for (var i = 0; i < this.data.question.list[paperindex].answerCustom.optionArr.length; i++) {
        optionid = this.data.question.list[paperindex].answerCustom.optionArr[i].optionId;
        optiontitle = this.data.question.list[paperindex].answerCustom.optionArr[i].option;
        if (optionid == answerId) {
          answerTitle = optiontitle;
        }
      }
      this.data.question.list[paperindex].answerCustom.answer = answerTitle;
    }
    if (this.data.question.list[paperindex].mainque.enginemode == 2) {
      //多选
      //遍历多选正确答案
      var answerTitleArr = [];
      var answerIdArr = common.splitToArray(this.data.question.list[paperindex].answerCustom.answerId, ",");
      var optionid;
      var optiontitle;
      for (var i = 0; i < this.data.question.list[paperindex].answerCustom.optionArr.length; i++) {
        optionid = this.data.question.list[paperindex].answerCustom.optionArr[i].optionId;
        optiontitle = this.data.question.list[paperindex].answerCustom.optionArr[i].option;
        for (var j = 0; j < answerIdArr.length; j++) {
          if (optionid == answerIdArr[j]) {
            answerTitleArr.push(optiontitle);
          }
        }
      }
      this.data.question.list[paperindex].answerCustom.answer = answerTitleArr.toString();
    }
    this.setData({ question: this.data.question });
  },
  // 做题界面播放视频
  paperVideoPlay: function (event) {
    var index = event.currentTarget.dataset.index;
    var videocode = this.data.question.list[index].answerCustom.knowledgepoint.videocode;
    var videoUrl = encodeURI(videocode);
    var knowpointcode;
    if (this.data.question.list[index].mainque.zhishidian != undefined) {
      knowpointcode = this.data.question.list[index].mainque.zhishidian[0].knowpointcode;
    }
    videoUrl = videoUrl.replace("http://", "https://");
    var url = '../videoPlayer/videoPlayer?videoUrl=' + videoUrl + '&channelnumber=' + knowpointcode;
    swan.navigateTo({
      url: encodeURI(url)
    });
  },
  // 绑定账户
  bindAccount: function () {
    var url = '../../../me/account/account';
    swan.navigateTo({
      url: encodeURI(url)
    });
  },
  leftBtnClick: function () {
    swan.navigateBack({});
  }
});