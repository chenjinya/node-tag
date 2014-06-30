var debug = require("./../core/debug.js").debug;
var events = require("events");
var util = require("util");
var SyncList = function(){
	this.init();
}
SyncList.prototype ={
	__eventBody:null,
	
	__events :events,
	__util: util,
	__buildEvent:function(){
		var self = this;

		var e = function(){
			self.__events.EventEmitter.call(this);
		}
		this.__util.inherits(e,this.__events.EventEmitter);
		this.__eventBody = new e();

	},
	init:function(){
		this.__buildEvent();
		//console.log(this);
		
	},
	sync:function(syncList){

		for(var i in syncList){
			if(!syncList[i][1]){
				syncList[i][1] = {};
			}
			this.__addSyncListener(i,syncList[i][0],syncList[i][1]);
		}
		debug(this.__syncListenerStack);
		this.__syncListenerStack[0].listener.call(this,this.__syncListenerStack[0]["data"]);
		
	},
	list:function(args){
		
		var argsArray =Array.prototype.slice.call(arguments);
		var endFunc = argsArray.pop();
		debug("listeners:",argsArray);
		var self = this;
		for(var i=0; i<argsArray.length; i++ ){
			self.__addListenerStack(argsArray[i]);
			var eventName = argsArray[i];
			self.__addListener(eventName,endFunc)
		}
		
		
	},
	isEmpty:function(obj){
		for(var k in obj){return false;}
			return true;
	},
	__addSyncListener:function(eventName,listener,data){
		var self = this;
		this.__syncListenerStack.push({event:eventName,listener:listener,data:data});
		this.once(eventName,function(_data){
				for(var i=1; i<self.__syncListenerStack.length; i++){
					self.__syncListenerStack[i-1] = self.__syncListenerStack[i];
				}
				self.__syncListenerStack.pop();
				self.__syncDataStack[eventName] = _data;
				if( 0 == self.__syncListenerStack.length){
					console.log("sync finished","dataStack:",self.__syncDataStack);
					return;
				}else{
					debug(self.__syncListenerStack);

					var tmpData =self.__syncListenerStack[0]["data"];
					tmpData["inherit"]= self.__syncDataStack[eventName];
					self.__syncListenerStack[0].listener.call(this,tmpData);

				}
				
			});
	},
	__addListener:function(eventName,endFunc){
		var _this = this;
		this.once(eventName,function(data){
				_this.__addDataStack(eventName,data);
				delete _this.__listenrsStack[eventName];
				debug(_this.__listenrsStack);
				if( _this.isEmpty(_this.__listenrsStack)){
					console.log(_this.__dataStack);
					endFunc.call(this,_this.__dataStack);
				}
			});
	},
	__syncListenerStack:[],
	__syncDataStack:{},
	__dataStack:{},
	__listenrsStack:{},
	__addListenerStack:function(eventName){
		this.__listenrsStack[eventName]=true;
		this.__dataStack[eventName] ="";
	},
	__addDataStack:function(eventName,data){
		this.__dataStack[eventName] = data;
	},
	
	emit:function(event,data){
		this.__eventBody.emit(event,data);
	},
	on:function(event,listener){
		this.__eventBody.on(event,listener);
	},
	once:function(event,listener){
		this.__eventBody.once(event,listener);
	}
};

exports.SyncList = SyncList;
var demo = function(args){

	var e = new SyncList();
	
	var test1 =function(d){
		debug("this is test1 function ",d);
		setTimeout(function(){
			e.emit("em1","haha1");
		},2000);
		
	}
	var test2 =function(d){
		
		debug("this is test2 function ",d);
		e.emit("em2","haha2")
	}
	var test3 =function(d){
		
		debug("this is test3 function ",d);
		e.emit("em3","haha3")
	}
	/**
	 *	每个方法最后执行完要有 e.emit(eventName,arg)
	 *	eventName方法名，arg 需要传递的数据
	 **/
	//use one
	/**
	 *	异步执行，最后处理
	 *  list(args...,function(data){});
	 *	args 为事件名
	 *	最后一个为执行的方程，参数data为前面方法执行后的传参
	 */
	e.list("em1","em2","em3",function(d){
		debug("all functions had been done",d);
	});
	test1("test1Param");
	test2("test2Param");
	test3("test3Param");
	//use two
	/**
	 *	顺序执行
	 *  sync(Param)
	 *	Param is object
	 *	eventName:[functionName,data];
	 *	data 传递到function 里，同时上一个函数执行后的数据，存放在data.inherit里面
	 */
	// e.sync({
	// 	em1:[test1,{a:"memeda"}],
	// 	em2:[test2,{b:"wahaha"}]
	// });
	
	
}
//demo();


