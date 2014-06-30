/**
 * Render File Template
 * @author chenjinya
 */

var debug = require("./debug.js").debug;
/**
 * Function render(__req,__res,__str,callback)
 * @description 编译模板准备和结束
 * @params __req 请求
 *		   __res 返回
 * 		   __str 文件内容
 *		   callback 回调函数
 *
 * @return 返回到浏览器的字符串
 */
var self = {};

function render(__req,__res,__str,__callback){
    var __CONFIG = require("./config.js");
    var __FS= require("fs");
    var __PATH = require("path");
    var __EVENTS = require("events");
    var __EVENT = "";
    var __UTIL   = require("util");
    var __OPENTAG =__CONFIG.openTag;
    var __ENDTAG =__CONFIG.endTag;
    var __ECHOTAG=__CONFIG.echoTag;
    var __TEMPLATESTRING = "";
    var __BUFFER ="";
    var __HTMLBUFFER="";
    var __BUFFERINDEX=0;
    var __FILEPATH = "";
    var __ASYNCLIST={};
    var __INCLUDELIST={};
    var querystring = require("querystring");
    var url = require("url");
    var req ="";
    var res ="";
    var e = function(){
        __EVENTS.EventEmitter.call(this);
    }
    __UTIL.inherits(e,__EVENTS.EventEmitter);
    __EVENT = new e();
    __EVENT.once("done",function(d){
        // console.log("start to call back");
        end();
    });
    function end(){

        if(typeof __callback =="function" ){

            __callback.call(this,req,res,__HTMLBUFFER);

        }
        return __HTMLBUFFER;
    }
    /**
     * Function echo(data)
     * @description 打印到页面的数据
     * @params data 需要显示的数据
     */
    function echo (){
        for(var i in arguments)
        __HTMLBUFFER+=arguments[i];
    }
    /**
     * Function exit()
     * @description 返回进程，取消渲染
     * @params null
     */

    function exit(){
        res.end();
    }
    /**
     * Function include(filepath,paramObj)
     * @description 包含文件
     * @params filepath 文件路径
     *		   paramObj 需要传递的参数，挂在self下
     */
    function include(filepath,paramObj,callback){
        for(var i in paramObj){
            self[i] = paramObj[i];
        }
        //debug(filepath);
        var dirname = __PATH.dirname(__FILEPATH);
        var fileContent = __FS.readFileSync(__PATH.resolve(dirname,filepath),__CONFIG.encoding);
       render(req,res,fileContent,function(request,respones,html){

            req = request;
            res = respones;

            if(callback){
                callback(html);
            }else{
               // debug(html);
                __HTMLBUFFER += html;
            }

       });

    }

    /**
     * Function async(name,func)
     * @description 异步方法
     * @params name 名称，不能有重复，相当事件名
     *		   func 异步方法的执行（里面必须有done(name,data)的方法执行，否则服务会一直等待)
     */
    function async(name,func){
        var placeholder = "__ASYCN_PLACEHOLDER_"+name.toUpperCase();
        __HTMLBUFFER +=placeholder;
        __ASYNCLIST[name] = "";
       // debug(placeholder,__ASYNCLIST);

        function asyncEcho(){
            for(var i in arguments)
                __ASYNCLIST[name] +=arguments[i];
        }
        if(typeof func =="function"){
            func.call(this,asyncEcho);
        }

    }
    /**
     * Function done(name,data)
     * @description 异步方法执行完毕
     * @params name 名称，不能有重复，相当事件名，与async的name保持一致
     *		   data 需要输出的内容，不谢则没有
     */
    function done(name,data){
        var placeholder = "__ASYCN_PLACEHOLDER_"+name.toUpperCase();
        //debug(placeholder,__ASYNCLIST);
        if(!data) data=__ASYNCLIST[name];
        __HTMLBUFFER = __HTMLBUFFER.replace(placeholder,data);
        delete __ASYNCLIST[name];
        //debug("this is done",name,data,__ASYNCLIST,__EVENT);
        if(isEmpty(__ASYNCLIST)){
            //debug("async is finishied")
            __EVENT.emit("done",data);
        }
    }
    /**
     * Function isEmpty(obj)
     * @description 判断对象里是否有属性
     * @params obj 对象
     *
     * @return true or false
     */
    function isEmpty(obj){
        for(var i in obj){
            return false;
        }
        return true;
    }
    /**
     * Function htmlCompile(end)
     * @description 编译文件字符串
     * @params end 编译结尾tag
     *
     * @return 编译后的字符串
     */
    function htmlCompile(end){
        var afterCompileStr = "";
        var endIndex = __TEMPLATESTRING.indexOf(end);
        if(endIndex<0){
            afterCompileStr = __TEMPLATESTRING.substring(0);
            __TEMPLATESTRING = "";

        }else{
            afterCompileStr = __TEMPLATESTRING.substring(0,endIndex );
            __TEMPLATESTRING = __TEMPLATESTRING.substring(endIndex+end.length);
        }
        if(afterCompileStr.indexOf(__ECHOTAG)==0){
            afterCompileStr = "echo("+afterCompileStr.substring(__ECHOTAG.length)+");";
        }
        return afterCompileStr;
    }
    /**
     * Function quoteEscape(str)
     * @description 双引号问题
     * @params str 需要处理的字符串
     *
     * @return 处理后的字符串
     */
    function quoteEscape(str){
        return (str.replace(/\"/g,"\\\""));
    }
    /**
     * Function forbidParam(params)
     * @description 编译模板变量禁止修改
     * @params 编译模板变量数组
     *
     * @return 是否包含禁止使用的变量
     */
    function forbidParam(params){
        var regexp = new RegExp();

        for(var i =0; i< params.length; i++){
            regexp.compile(params[i]+"");
            if(regexp.test(__TEMPLATESTRING)){
                __HTMLBUFFER = params[i]+" is not allowed to be modified in the file;";
                return true;
            }
        }
        return false;
    }
    /**
     * Function compile(str)
     * @description 编译文件入口
     * @return 出现异常
     */
    function compile(){

        if(__TEMPLATESTRING.length <=0 ){
            return;
        }
        var htmlSplit = htmlCompile(__OPENTAG).split("\n");
        var html ="";
        for(var i=0; i< htmlSplit.length; i++){
            if(i!=0 && i!=htmlSplit.length-1)
                html += "echo(\""+quoteEscape (htmlSplit[i])+"\\n\");";
            else
                html += "echo(\""+quoteEscape (htmlSplit[i])+"\");";
        }
        var js = htmlCompile(__ENDTAG)+";";
        __BUFFER +=html;
        __BUFFER +=js;
        //debug compile process
        //console.log("html:"+html);
        //console.log("js:"+js);
        compile();
        return __BUFFER;
    }
    __TEMPLATESTRING = __str;
    __BUFFER="";
    __HTMLBUFFER="";
    __FILEPATH = __req.filePath;
    req = __req;
    res = __res;

    if(__CONFIG.nodejsFileType == __req.fileType){
        __BUFFER = __str;

    }else{
        forbidParam(["__ASYCN_PLACEHOLDER_"]);
        compile();
    }
    try{
        __ASYNCLIST["main"]="";
        var func = new Function("_echo","_include","_async","_done","_require","_req","_res","_self","var self = _self,req = _req,res = _res,require =_require, async = _async, done=_done,echo= _echo,include=_include;"+__BUFFER+"");
        new func(echo,include,async,done,require,req,res,self);
        done("main");
    }catch(e){
        console.log("\033[22;31m "+ e.stack+"\033[0m");
    }


}

exports.go =render;
