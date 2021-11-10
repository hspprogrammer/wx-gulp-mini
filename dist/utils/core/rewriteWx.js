import {addEventListener, emit,remove} from "./event.js"
import WxHttp from "./http"


function rewritePage (){
    let cPage = Page
   
    Page = function Page(options){
        options['$$on'] = addEventListener
        options['$$remove'] = remove
        options['$$emit'] = emit
        options['$http'] = new WxHttp()
        return cPage(options);
    }
    
}

rewritePage()