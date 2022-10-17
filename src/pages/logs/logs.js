// logs.js
const util = require('../../utils/util.js')

Page({
  path:"pages/logs/logs",
  data: {
    logs: []
  },
  registerPreload(){
    this.getData()
    this.getData2()
  },
  onLoad() {
    this.$isBuild = true;
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        return {
          date: util.formatTime(new Date(log)),
          timeStamp: log
        }
      })
    })
  },
  getData(){
    setTimeout(()=>{
      this.$setState({
        text:"请求的数据"
      })
      console.log("请求完成")
    },3000)
  },

  getData2(){
    setTimeout(()=>{
      this.$setState({
        text2:"请求的数据2"
      })
      console.log("请求完成2")
    },6000)
  }
})
