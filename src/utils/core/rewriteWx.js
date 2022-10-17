import {addEventListener, emit,remove} from "./event.js"
import {WxHttp} from "./http"

const allPagePreloadMap = {};//所有页面预加载方法的集合
const allPreloadDateMap = {};//所有页面预加载数据的集合

function rewritePage (){
    let cPage = Page
   
    Page = function rebuildPage(options){
        if (!options['onLoad']) options['onLoad'] = function () { };
        if (!options['onShow']) options['onShow'] = function () { };
        if (!options['onHide']) options['onHide'] = function () { };
        if (!options['onUnload']) options['onUnload'] = function () { };
        
        options['$$on'] = addEventListener
        options['$$remove'] = remove
        options['$$emit'] = emit
        options['$http'] = function(){
            return WxHttp.apply(this,[...arguments]);
        }

        const copyOnLoad = options['onLoad'];
        options['onLoad'] = function(){
            //当前页面是否有注册预加载函数
            if(allPagePreloadMap[this.path]){
                //预加载函数是否执行
                if(allPreloadDateMap[this.path]){
                    this.setData.call(this,{...allPreloadDateMap[this.path]});
                }else{
                    allPagePreloadMap[this.path].call(this,[...arguments]);
                }
            }
            return copyOnLoad.apply(this,[...arguments])
        }

        const copyOnShow = options['onShow'];
        options['onShow'] = function(){
            this.$isBuild = true;
            return copyOnShow.apply(this,[...arguments])
        }

        const copyOnHide= options['onHide'];
        options['onHide'] = function(){
            this.$isBuild = false;
            return copyOnHide.apply(this,[...arguments])
        }

        const copyOnUnload = options['onUnload'];
        options['onUnload'] = function(){
            delete  allPreloadDateMap[this.path];
            return copyOnUnload.apply(this,[...arguments])
        }


        
        // 注册页面的预加载方法
        if(options['registerPreload']){
            if(!options['path']) {
                console.error('注册预加载方法必须同时设置页面路径，同路由跳转url')
            }else{
                allPagePreloadMap[options['path']] = options['registerPreload'].bind(options);
            }
        }
        

        //封装setData，建议只在预加载方法中使用,如果页面已经创建，数据直接更新到data，否则存储到缓存中
        options['$setState'] = function(){
            const pageInstance = getCurrentPages()[getCurrentPages().length - 1];
            if(pageInstance.route == this.path){
                allPreloadDateMap[this.path] = {...allPreloadDateMap[this.path],...arguments[0]}
                return pageInstance.setData.apply(pageInstance,[...arguments]);
            }else{
                allPreloadDateMap[this.path] = {...allPreloadDateMap[this.path],...arguments[0]}
            }
        }

        //预加载页面数据
        options['$preload'] = async function(path,data={}){
            allPreloadDateMap[path] = {};
            await allPagePreloadMap[path](data);
        }

        options["$route"] = function (url,data = {},isPreload = false,options = {}){
            if(isPreload){
                allPreloadDateMap[url] = {};
                allPagePreloadMap[url](data);
            } 
            url = '/'+url;
            let query = "";
            for(let key in data){
                data[key] + '&' + query;
            }
            url = url + `${query.length?'?'+query:query}`
            if(getCurrentPages().length>9){
                wx.navigateTo({
                    url,
                    ...options
                })
            }else{
                wx.reLaunch({
                    url,
                    ...options
                })
            }
        }
        

        return cPage(options);
    }
    
}

function rewriteComponent (){
    let cComponent = Component
   
    Component = function rebuildComponent(options){
        options['methods'] = {
            ...options['methods'],
            $$on: addEventListener,
            $$emit: emit,
            $$remove: remove,
            $http: function () {
                return WxHttp.apply(this,[...arguments]);
            },
        }

        return cComponent(options);
    }
    
}

rewritePage()
rewriteComponent()