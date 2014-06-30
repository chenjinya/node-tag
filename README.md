node-plus
=========

a web engine in Node.js

=========
Info
---------
####
Author: Chen Jinya
Email: jinyachen@gmail.com

Start
---------
####
	#node app.js

Help
---------
采用Html中嵌入Node.js语法的方式渲染网页。类似PHP。分割标签为 <+ +>
####
	<+ include("title.html") +>
这里是基于nodejs的服务器动态脚本
<p><+ echo("当你看到这里时，说明软体已经正常运作。"); +></p>
当你看到这里时，说明软体已经正常运作。

<p>循环</p>
<+ for(var i=0; i<3; i++){ +>
	<p><+=i +></p>
<+ } +>
			
循环
0
1
2
<p>时间：<+=("The time is:"+(new Date())) +></p>
			
时间：The time is:Mon Jun 30 2014 11:19:47 GMT+0800 (CST)
异步：<+ async("listenername",function(echo){
				setTimeout(function(){
				echo ("异步执行部分已近完成")
				done("listenername");
			},1000);
			});
			 +>
			
异步：异步执行部分已近完成,网页因此延迟1000毫秒显示

