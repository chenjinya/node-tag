var fs =require("fs");
var ScanFiles =function(rootPath,deepIndex,scanDeep){
    if(rootPath.substr(rootPath.length-1,rootPath.length) != "/"){
        rootPath+="/";
    }
    if(!scanDeep) scanDeep=1;
    if(!deepIndex) deepIndex=0;
    if(deepIndex>=scanDeep){
        return false;
    }else{
        deepIndex++;
    }
    if(!fs.existsSync(rootPath)){
        return false;
    }
    var fileTree= fs.readdirSync(rootPath);
    for(var i=0; i<fileTree.length; i++){
        var filePath = rootPath+fileTree[i];
        var stat = fs.statSync(filePath);
        if(stat.isFile()){
            fileTree[i] = {name:fileTree[i],type:"file"};
        }else if(stat.isDirectory()){
            fileTree[i] = {name:fileTree[i],type:"dir"};
            fileTree[i]['dir']=ScanFiles(filePath+"/",deepIndex);
        }
    }

    return fileTree;

}
exports.ScanFiles = ScanFiles;

