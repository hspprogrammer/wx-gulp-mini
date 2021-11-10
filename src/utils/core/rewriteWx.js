import {addEventListener, emit,remove} from "./event.js"
import {WxHttp} from "./http"


function rewritePage (){
    let cPage = Page
   
    Page = function rebuildPage(options){
        options['$$on'] = addEventListener
        options['$$remove'] = remove
        options['$$emit'] = emit
        options['$http'] = function(){
            return WxHttp.apply(this,[...arguments]);
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