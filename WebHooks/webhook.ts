// const secret = "your_secret_here";
// const repo = "~/your_repo_path_here/";

const http = require('http');
const enc = require('crypto');
const exec = require('child_process').exec;

console.log ("FUCK");

http.createServer(function (req, res) {
    console.log ("Running");
    req.on('data', function(chunk) {
        // let sig = "sha1=" + enc.createHmac('sha1', secret).update(chunk.toString()).digest('hex');
        // if (req.headers['x-hub-signature'] == sig) {
        //     exec('cd ' + repo + ' && git pull');
        // }
        console.log ("Execing");
        exec ('~/ece-461-project-part2/update')
    });

    res.end();
}).listen(10000);