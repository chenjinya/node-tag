/**
 * File System Session
 * @author chenjinya
 */

var fs = require('fs');
var config = require("./config.js");
var crypto = require("crypto");
var path = require("path");
var debug = require("./debug.js").debug;
var sessionPath = "./session";
function isEmpty(obj){
    for(var i in obj){
        return false;
    }
    return true;
}
/**
 * Function setSession(req)
 * @description 设置session
 * @param req 请求
 * @return  返回处理后的req.session
 */
function setSession(req){
    /*
    //传统session-cookie解析
    var sessionData =""
    if(req.headers.cookie && req.headers.cookie.indexOf(config.session.key+"=") >= 0){
        //console.log(sessionData);
        sessionData = req.headers.cookie.substr(req.headers.cookie.indexOf(config.session.key+"=")+1+config.session.key.length);
        if(sessionData.indexOf(";")>0){
            sessionData = sessionData.substr(0,sessionData.indexOf(";"));
        }
        sessionData = JSON.parse(unescape(sessionData));
        req.session.user =sessionData;

    }else{
        req.session.user={};
    }*/
    if(req.session.user && !isEmpty(req.session.user)){
        try{
            var filename ="";
            var time  = new Date().getTime().toString();
            req.session.create = time;
            if(!req.session.key){
                var md5 = crypto.createHash("md5");
                md5.update(new Date().getTime().toString());
                filename =md5.digest("Hex");
                req.session.update = req.session.create ;
                req.session.key = filename;
            }else
            {
                req.session.update = time;
                filename = req.session.key;
            }
            if(!fs.existsSync(sessionPath)){
                if(!fs.mkdirSync(sessionPath)){
                    console.log("can not make session dir!");
                    return req.session;

                }
            }
            fs.writeFileSync(sessionPath+"/"+filename,JSON.stringify(req.session));
//            debug("set session",req.session);
             return req.session;
        }catch(e){
            console.log(e.stack);
        }

    }else{
        req.session={};
        return req.session;
    }
}
/**
 * Function getSession(req)
 * @description 设置session
 * @param req 请求
 * @return  返回处理后的req.session
 */
function getSession(req){
    var sessionData ="";
     if(req.headers.cookie && req.headers.cookie.indexOf(config.session.key+"=") >= 0){
     //console.log(sessionData);
     sessionData = req.headers.cookie.substr(req.headers.cookie.indexOf(config.session.key+"=")+1+config.session.key.length);
     if(sessionData.indexOf(";")>0){
     sessionData = sessionData.substr(0,sessionData.indexOf(";"));
     }
     //sessionData = JSON.parse(unescape(sessionData));
     req.session.key =( sessionData == "undefined" ? "":sessionData);
     }else{
         req.session.user={};
         req.session.key ="";
     }
    if(req.session.key){
        try{
            var filename =req.session.key;
            if(!fs.existsSync(sessionPath+"/"+filename)){
                return req.session;
            }
            var fileContent = fs.readFileSync(sessionPath+"/"+filename);
            req.session = JSON.parse(fileContent);
//            debug("get session",req.session);
            return req.session;
        }catch(e){
            console.log(e.stack);
        }
    }else{

        return req.session;
    }
}
exports.setSession = setSession;
exports.getSession = getSession;