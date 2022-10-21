Page({
    path:"pageB/index/index",
    registerPreload(){
        setTimeout(()=>{
            console.log(`页面B预加载请求完成`)
        },2000)
    },
})