var server = require('./core/server.js');
var router = require('./core/router.js');
var cluster = require("cluster");
var numCPUs = require('os').cpus().length;
console.log("is master:"+cluster.isMaster);
console.log("is_cluster:"+cluster.isWorker);

if (cluster.isMaster) {
    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('exit', function(worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
        cluster.fork();
    });
} else {
    server.start(router.router);

}