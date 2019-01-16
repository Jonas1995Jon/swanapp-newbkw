//获取应用实例
var app = getApp()
Page({
  data: {
    stars: [0, 1, 2, 3, 4],
    normalSrc: '../../../image/video/normal.png',
    selectedSrc: '../../../image/video/selected.png',
    halfSrc: '../../../image/video/half.png',
    textareaStr: '',
    keylist: [0, 0, 0, 0],
    titlelist: [
      '1.讲师仪表仪态得体。',
      '2.讲课声音清晰，语速适中，有良好的表达能力。',
      '3.讲师专业基础知识扎实，对教材变动了解清晰，讲课清晰易懂。',
      '4.您对本次课程的综合评分是？',
      // '5.其他建议'
    ],
    scrollTop: 0
  },
  onLoad: function () {
    swan.setNavigationBarTitle({
      title: '课程评价'
    });
  },
  onUnload: function () {
    let pages = getCurrentPages();
    let prePage = pages.length - 1;
    pages[prePage].setData({ isVidelPage: false });
  },
  startClick: function (e) {
    var key = e.currentTarget.dataset.key;
    var index = e.currentTarget.dataset.index
    if (this.data.keylist[index] >= key) {
      key -= 0.5;
    }
    this.data.keylist[index] = key;
    this.setData({
      keylist: this.data.keylist
    })
  },
  proposal: function (e) {
    this.setData({
      textareaStr: e.detail.value
    })
  },
  proposalClick: function () {
    console.log(this.data.keylist)
    console.log(this.data.textareaStr)
    let pages = getCurrentPages();
    let prePage = pages.length - 2;
    pages[prePage].setData({ isVidelPage: false });
    swan.navigateBack({
      delta: prePage
    });
  },
  startscroll: function (e) {
    var index = e.currentTarget.dataset.index;
    var endX = e.changedTouches[0].clientX;
    var endY = e.changedTouches[0].clientY;
    let query = swan.createSelectorQuery().in(this);
    query.select('.starttouch').boundingClientRect();
    query.select('.star-image').boundingClientRect();
    query.exec(res => {
      var starthzW = res[0].width;//盒子宽
      var starthzLeft = res[0].left;
      var startWidth = res[1].width;//每颗星星宽
      var jianju = (starthzW - startWidth * 5) / 4;//星星之间的间距
      // console.log(starthzW, starthzLeft, startWidth, jianju)
      if (endX >= starthzLeft && (endX - starthzLeft) <= starthzW) {
        // console.log(endX)
        var sum = 0.5;
        if (endX - starthzLeft <= startWidth / 2) {
          return;
        } else {
          if (endX - starthzLeft > starthzW - startWidth / 2) {
            sum += (endX - starthzLeft - startWidth) / (startWidth / 2 + jianju / 2) / 2 + 0.5;
            // sum = (endX - starthzLeft - jianju * 4) / startWidth - 0.5;
          } else {
            sum += (endX - starthzLeft - startWidth) / (startWidth / 2 + jianju / 2) / 2
          }
        }
        if (parseFloat(sum).toFixed(1) - parseInt(sum) > 0.5) {
          sum = parseInt(sum) + 1;
        } else if (parseFloat(sum).toFixed(1) - parseInt(sum) == 0) {
          return;
        }
        else {
          sum = parseInt(sum) + 0.5;
        }
        // console.log(sum)
        this.data.keylist[index] = sum;
        this.setData({
          keylist: this.data.keylist
        })
      }
    })
  }
})