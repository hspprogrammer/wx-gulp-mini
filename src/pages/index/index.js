// index.js

const { WxHttp } = require("../../utils/core/http")

// 获取应用实例
const app = getApp()

Page({
  path:"pages/index/index",
  data: {},
  onLoad() {
    this.$$on('testEvent',this,(data)=>{
        console.log(data)
      })
    // this.$preload('pages/logs/logs')
    // this.httpTest()
   
  },
  //发布订阅模拟
  onEventEmit(){
      // this.$$emit('testEvent','这里是首页的button')
      this.$route('pages/logs/logs',{},true)
  },
  //请求模拟
  async httpTest(){
    const res = await this.$http({
      baseUrl:'https://mock.apipost.cn/app/mock/project/b28f1d33-3071-48cf-b24f-83b2ad28537a/',
      url:'aaa/bb/cc/api',
      method:'GET'
    })
    console.info(`请求结果${JSON.stringify(res)}`)
  }
})
