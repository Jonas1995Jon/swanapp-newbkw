//app.js
import common from './utils/common.js';
var submitPaperBtnHidden = false; //交卷按钮是否隐藏
var aldstat = require("./utils/ald-stat.js");
const mtjwxsdk = require('./utils/mtj-wx-sdk.js');
App({
  onLaunch: function () {
    if (swan.canIUse('getUpdateManager')) {
      const updateManager = swan.getUpdateManager();
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            swan.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                console.log(res);
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate();
                }
              }
            });
          });
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            swan.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~'
            });
          });
        }
      });
    } else {}
    // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
    // wx.showModal({
    //   title: '提示',
    //   content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
    // })

    // console.log(common.randomString(32));
    // 展示本地存储能力
    var logs = swan.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    swan.setStorageSync('logs', logs);
    var firstLoginTime = swan.getStorageSync('firstLoginTime') || [];
    if (firstLoginTime.length < 1) {
      var newDate = new Date();
      swan.setStorageSync('firstLoginTime', common.formatTime(newDate));
    }
    swan.removeStorageSync('learnCheckIndex');
  },
  globalData: {
    userInfo: null,
    bigclass: null,
    smallclass: null,
    bkw_token: 'bangkaowang2014@bangkaowang',
    appname: 'bkw-xcx',
    appversion: '1.2.3',
    appbuild: '201812171033',
    market: 'baiduapp',
    from: 'baiduapp',
    appid: '14294198', //小程序appid
    appsecret: 'Qh8oFzcfH6RpOuLDusUBAyv9hZmw0BXq',//小程序appsecret
    sh_key: 'zBIrPh5NhdHM3r8oFGPWtIEUaBsc8NwG',//商户key
    source: '1',
    default_sessionid: 'a4bfdca7eebcd915b30372cfe234b986',
    default_uid: 'A5B2F24C638FEF59',
    videosource: 'aly', //视频源
    questionnumber: 5, //每次抽取错题回顾题目数量。
    isorder: '1', //是否按顺序刷题
    submitPaperBtnHidden: submitPaperBtnHidden, //交卷按钮是否隐藏
    definition: 'ld', //视频清晰度
    gateway: 'B2', //生成订单方式
    learnType: [[{ type: 2 }, { name: '练习模式' }], //练习模式0
    [{ type: 3 }, { name: '自我测评' }], //自我测评1
    [{ type: 5 }, { name: '模拟测试' }], //模拟测试2
    [{ type: 6 }, { name: '揭密押题' }], //揭密押题3
    [{ type: 7 }, { name: '我的错题' }], //错题回顾4
    [{ type: 11 }, { name: '真题再现' }], //真题再现5
    [{ type: 12 }, { name: '我的收藏' }], //收藏试题6
    [{ type: 13 }, { name: '我的笔记' }], //笔记试题7
    [{ type: 14 }, { name: '视频点播' }], //视频点播8
    [{ type: 15 }, { name: '免费试用' }], //免费试用9
    [{ type: 16 }, { name: '随手练一练' }], //随手练一练10
    [{ type: 17 }, { name: '考点精解' }], //考点精解11
    [{ type: 30 }, { name: '猜你会错' }], //猜你会错12
    [{ type: 31 }, { name: '智能刷题' }], //智能刷题13
    [{ type: 46 }, { name: '月度考试' }]],
    enginemode: [{ enginemode: 1 }, //单选题模式0
    { enginemode: 2 }, //多选题模式1
    { enginemode: 3 }, //判断题模式2
    { enginemode: 4 }, //主观题模式3
    { enginemode: 5 }, //操作题模式4
    { enginemode: 6 }]

  }
});
module.exports = {
  submitPaperBtnHidden
};