process.title = "webhook-listener";

const path = require('node:path');
const http = require('http');
const enc = require('crypto');
const exec = require('child_process').execFileSync;

const secret = "ECE461-123";


http.createServer(function (req, res) {
    try {
        req.on('data', function(chunk) {
            let sig = "sha1=" + enc.createHmac('sha1', secret).update(chunk.toString()).digest('hex'); 
            if (req.headers['x-hub-signature'] == sig) {
                exec(path.join(process.env['HOME'], 'ece-461-project-part2/update.sh'));
            }
        });
    } catch (error) {
        console.log ("Message Received, but cannot verify Authenticity. Updating server anyway");
        exec(path.join(process.env['HOME'], 'ece-461-project-part2/update.sh'));
    }
        

    res.end('200');
}).listen(10000);