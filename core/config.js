//config
var config={};
config["root"] = "./html";//网页文件的根目录
config['encoding']="utf8";//文件编码
config['compileFileType'] ="html";//模板文件的扩展名
config['nodejsFileType'] = "nodp";//纯node js 文件
config['port']=8080;//服务器端口
config['log']=true;//输出log
config['session']={//session 配置
	'key':"nodePlus",
	'maxAge':3600*24*7
}
config['openTag'] = "<+";//模板js语法 起始标签
config['endTag'] = "+>";//模板js语法 结束标签
config['echoTag']="=";//模板js语法 快捷显示
config['filesMap']={//路由到文件映射表
	'/404':"/404.html"//必须
   
}

for(var i in config){
	exports[i] = config[i];
}
