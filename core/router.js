/**
 * web link to file
 * @author chenjinya
 */

var fs = require('fs');
var url = require("url");
var config = require("./config.js");
var render= require("./render.js");
var contentTypes = require("./contenttype.js");
var querystring = require("querystring");
var debug = require("./debug").debug;
var session = require("./session");
/**
 * Function route(req,res)
 * @description 总路由   
 * @param req 请求
 * @param res 返回
 */
function router(req,res){
    var __RESPONSECODE=200;
    var filePath=config.root;//服务根目录
	var pathname=url.parse(req.url).pathname;//获取请求文件目录
	if(config.filesMap[pathname]){
		pathname = config.filesMap[pathname];//查找配置文件中是否包含请求的文件目录
	}
    try{
        pathname = decodeURI(pathname);
    }catch (e){
        console.log(e);
    }
	var reg= /\//;
	var pathResArray= pathname.split(reg);//将目录分割成数组
	var controlName = pathResArray.pop();//获取最后一个路径
	var fileTypeArray =controlName.split(".");//将文件名和扩展名分开
	var fileType = fileTypeArray.pop().toLowerCase();//将文件类型变成小写
	var contentType=fileType ? (contentTypes[fileType] == undefined ? "\033[22;31m content-type-is-not-in-config \033[0m ": contentTypes[fileType] ):"";//获取文件类型
	if(controlName==""){ //如果没有扩展名，则自动判断为默认文件
		fileType = config.compileFileType;
		pathname+="index."+config.compileFileType;
	}
	filePath+=pathname;//得到服务器上文件路径
	//webpath ----> filename
    var time = new Date();
    //打出文件信息Log
	if(config.log) console.log("\033[22;34m "+pathname+"--->"+filePath+" "+"\033[0m",contentType,req.method,"\033[22;35m  IP:"+(req.headers["x-real-ip"]? req.headers["x-real-ip"] :req.connection.remoteAddress )+" "+(time.getMonth()+1)+"-"+time.getDate()+" "+time.getHours()+":"+time.getMinutes()+":"+time.getSeconds()+"\033[0m");
	var readFileOption = {};
    //对文件类型进行判断，如果为模板文件，需要对文件的读取进行设置
	if(fileType == config.compileFileType || fileType == config.nodejsFileType ){
		contentType = "text/html";
		readFileOption.encoding =config.encoding;
	}
    /**
     * 处理post数据
     * **/
    (function handlePost(){
        var postData =[];
        //var stream ="";
        req.on('data',function(chunk){
            postData.push(chunk);
            //stream +=chunk;
        });
        req.on('end',function(){
            var postStr = postData.join("");
            //req.file = stream
            //console.log(req.file);
           req.post = querystring.parse(postStr);//将Post数据处理为对象
        });
    })();
 	try{
		
		fs.readFile(filePath,readFileOption,function (err,data){//读取文件
			if(err) {
                //如果出现错误，返回404页面并输出Log
                if(config.log) console.log("\033[01;33m "+"Can not read the file!-"+err+"\033[0m");
				req.url="/404";
				if(config.filesMap['/404']){
					router(req,res);
				}else{
					__RESPONSECODE = 404;
				}
                return;
			}else{
                var html="";
                //如果需要编译，走编译流程，如果不需要编译，则直接返回静态资源
                if(readFileOption.encoding || fileType == config.nodejsFileType){
                    req.filePath = filePath;
                    var date = new Date();
                    date.setTime(date.getTime()+config.session.maxAge*1000);//设置session 过期时间
                    config.session.expires = date.toUTCString();
                    req.session={};
                    req.session = session.getSession(req);//获取session
                    var oldSessionCreate = req.session.create;//获取Session创建时间
                    req.fileType = fileType;
                    render.go(req,res,data,function(request,respones,html){//进行编译
                        //将编译后的req和res重新更新
                        req = request;
                        res = respones;
                        if(res.contentType)
                            contentType = res.contentType;
                        req.session = session.setSession(req);//设置session信息

                        //判断是否需要重新设置session
                        if(req.session.create !=oldSessionCreate  ){
                            debug("set cookie",req.session);
                            res.writeHead(__RESPONSECODE,{
                                // "Set-Cookie":config.session.key+"="+escape(JSON.stringify(req.session.user))+";path=/;expires="+config.session.expires,
                                "Set-Cookie":config.session.key+"="+(req.session.key ? req.session.key :"")+";path=/;expires="+config.session.expires,
                                "Content-Type":contentType
                            });
                        }else{
                            res.writeHead(__RESPONSECODE,{
                                "Content-Type":contentType
                            });
                        }
                        //返回浏览器信息
                        html  = html.trim(html);
                        res.write(html);
                        res.end();

                    });
                }
                else {
                    res.writeHead(__RESPONSECODE,{
                        "Content-Type":contentType
                    });
                    html = data;
                    res.write(html);
                    res.end();
                }
            }
		});
	}
	catch(e){
		res.writeHead(500);
		res.write("Can not find the file!");
		res.end();
		console.log("fs.readFile error:"+ e.stack);
	}
}
exports.router = router;