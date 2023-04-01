const path = require('node:path');

const secret = "your_secret_here";
const repo = "~/your_repo_path_here/";

const http = require('http');
const enc = require('crypto');
const exec = require('child_process').execFileSync;

http.createServer(function (req, res) {
    req.on('data', function(chunk) {
        // let sig = "sha1=" + enc.createHmac('sha1', secret).update(chunk.toString()).digest('hex'); 
        // if (req.headers['x-hub-signature'] == sig) {
        //     exec('~/ece-461-project-part2/update');
        // }
    });

    console.log ("Bash Script Moment");
    exec(path.join(process.env['HOME'], 'ece-461-project-part2/update.sh'));

    res.end();
}).listen(10000);