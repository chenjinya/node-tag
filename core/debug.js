var config =require("./config.js");
var debugIndex=0;
var debug = function  (data) {
	if(!config.log){
        return;
    }
	var colorMap=[
		{code:"\033[22;31m" , name:"red"},
		{code:"\033[22;32m" , name:"green"},
		{code:"\033[22;33m" , name:"brown"},
		{code:"\033[22;34m" , name:"blue"},
		{code:"\033[22;35m" , name:"magenta"},
		{code:"\033[22;36m" , name:"cyan"},
		{code:"\033[22;37m" , name:"gray"},
		{code:"\033[01;30m" , name:"dark gray"},
		{code:"\033[01;31m" , name:"light red"},
		{code:"\033[01;32m" , name:"light green"},
		{code:"\033[01;33m" , name:"yellow"},
		{code:"\033[01;34m" , name:"light blue"},
		{code:"\033[01;35m" , name:"light magenta"},
		{code:"\033[01;36m" , name:"light cyan"}
	];
	var length = colorMap.length;
		var index = Math.ceil(Math.random()*(length-1));
		console.log(colorMap[index].code+(debugIndex++)+"-->");
		for(var i in arguments){
			console.log(arguments[i])
		}
		console.log("\033[0m");
};

exports.debug = debug;