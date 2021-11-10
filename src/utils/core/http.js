let uid = 0; // 初始id
let count = 0; // 当前请求数量
let max = 10; // 最大请求数量
let pool = []; // 请求队列
let hash = {}; // 当前所有请求的信息

function WxHttp(params) {
    let id = uid++;
    let context = this;
    pool.push(hash[id] = { id, params, isAbort: false, instance: context });

    function require(){
        if(count >= max || !pool.length){
            return false
        }
        let obj = pool.shift() || {};
        let { id, params, hasAbort } = obj;
        if (!params || !params.url || hasAbort) return request();
        count ++;

        return new Promise(async (resolve,reject)=>{
            if(!params.url){
                console.error('url为必填值')
                reject('url为必填值')
            }
            params.url = 'HTTP_BASE_URL'+params.url
            params.method = params.method || 'GET'
            params.data = params.data || {}

            obj.request = wx.request({
                ...params,
                success (res) {
                  resolve(res.data);
                },
                fail (err) {
                    // wx.showToast({
                    //     title: '请检查网络连接状态',
                    //     icon: 'none'
                    // });
                    // wx.hideLoading();
                    // reject(err);
                },
              })
        })
    }

    return require
}

function abortHttp(){

}

module.exports = {
    WxHttp,
    abortHttp
}