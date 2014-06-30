var http = require("http");
var config = require("./config.js")
function start(router){
	function onRequest(req,res){
        if(!process.listeners("uncaughtException")){ //监听未捕获异常
            function noExit(){
                console.log('Caught exception: ' ,err.stack);
                res.statusCode = 500;
                res.setHeader('content-type', 'text/plain');
                res.end('There was a problem,please contact administrator!\n');
            }
            process.on('uncaughtException',noExit);

        }
        router(req,res);//进行路由操作
	}
	http.createServer(onRequest).listen(config.port);//创建服务器
	console.log("server is start at port:"+config.port+', pid is '+process.pid);//打出服务器开启Log
}
exports.start = start;
