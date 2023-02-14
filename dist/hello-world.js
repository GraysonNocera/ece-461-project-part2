"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const { spawn } = require("child_process");
const fs_1 = require("fs");
const jq = require('node-jq');
var stream = require('stream');
const ndjson = require('ndjson');
function runPythonScript(argument, user, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const process = spawn("python3", ["metrics.py", argument, user, repo]);
            let result = "";
            process.stdout.on("data", (data) => {
                result += data.toString();
            });
            process.on("close", (code) => {
                if (code !== 0) {
                    reject(`Python script exited with code ${code}`);
                }
                resolve(result);
            });
        });
    });
}
function getData() {
    let Input = '';
    for (let i = 0; i < process.argv.slice(2).length; i++) {
        Input += process.argv.slice(2)[i] + ' ';
    }
    Input = Input.trim();
    const file = (0, fs_1.readFileSync)(Input, 'utf-8');
    return file;
}
function cleanData(data) {
    const wordList = data.split('\n');
    for (let i = 0; i < wordList.length; i++) {
        wordList[i] = wordList[i].replace("https://", "").replace("www.", "").replace(".com", "");
    }
    return wordList;
}
function sortOutput(output, netscores) {
    var finalOutput = [];
    let sorted = [...netscores].sort(function (a, b) { return a - b; }).reverse();
    for (var val of sorted) {
        let index = 0;
        for (let i = 0; i < netscores.length; i++) {
            if (val == netscores[i]) {
                index = i;
                break;
            }
        }
        finalOutput.push(output[index]);
        netscores[index] = -2;
    }
    return finalOutput;
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        var objs = [];
        let data = getData();
        let wordList = cleanData(data);
        console.log('URL NET_SCORE RAMP_UP_SCORE CORRECTNESS_SCORE BUS_FACTOR_SCORE RESPONSIVE_MAINTAINER_SCORE LICENSE_SCORE');
        var netscores = [];
        var outputStrings = [];
        for (let i = 0; i < wordList.length; i++) {
            let website = wordList[i].split('/')[0];
            let user = wordList[i].split('/')[1];
            let repo = wordList[i].split('/')[2];
            var downloads = 0;
            var issues = 0;
            var forks = 0;
            var contributors = 0;
            var license = 0;
            let URL = data.split("\n")[i];
            let output = "";
            let netscore = 0;
            if (website == "github") {
                try {
                    yield runPythonScript("get_downloads", user, repo);
                    const path = require('path');
                    let jsonstring = require(path.join(__dirname, '../', `/downloads${user}.json`));
                    downloads = +jsonstring.split(':')[1];
                    let temp = 0;
                    if (Number(downloads) == null || Number(downloads) < 100) {
                        temp = 0;
                    }
                    else if (Number(downloads) > 100 && Number(downloads) < 200) {
                        temp = .5;
                    }
                    else {
                        temp = 1;
                    }
                    output = output + " " + temp;
                    netscore += temp * .25;
                }
                catch (error) {
                    console.error(error);
                }
                try {
                    yield runPythonScript("get_issues", user, repo);
                    const path = require('path');
                    let jsonstring = require(path.join(__dirname, '../', `/issues${user}.json`));
                    issues = +jsonstring.split(':')[1];
                    let temp = 0;
                    if (Number(issues) == null || Number(issues) < 100) {
                        temp = 0;
                    }
                    else if (Number(issues) > 100 && Number(issues) < 200) {
                        temp = .5;
                    }
                    else {
                        temp = 1;
                    }
                    output = output + " " + temp;
                    netscore += temp * .20;
                }
                catch (error) {
                    console.error(error);
                }
                try {
                    yield runPythonScript("get_contributors", user, repo);
                    const path = require('path');
                    let jsonstring = require(path.join(__dirname, '../', `/contributors${user}.json`));
                    contributors = +jsonstring.split(':')[1];
                    let temp = 0;
                    if (Number(contributors) == null || Number(contributors) < 10) {
                        temp = 0;
                    }
                    else if (Number(contributors) > 10 && Number(contributors) < 20) {
                        temp = .5;
                    }
                    else {
                        temp = 1;
                    }
                    output = output + " " + temp;
                    netscore += temp * .25;
                }
                catch (error) {
                    console.error(error);
                }
                try {
                    yield runPythonScript("get_forks", user, repo);
                    const path = require('path');
                    let jsonstring = require(path.join(__dirname, '../', `/forks${user}.json`));
                    forks = +jsonstring.split(':')[1];
                    let temp = 0;
                    if (Number(forks) == null || Number(forks) < 100) {
                        temp = 0;
                    }
                    else if (Number(forks) > 100 && Number(forks) < 200) {
                        temp = .5;
                    }
                    else {
                        temp = 1;
                    }
                    output = output + " " + temp;
                    netscore += temp * .1;
                }
                catch (error) {
                    console.error(error);
                }
                try {
                    yield runPythonScript("get_license", user, repo);
                    const path = require('path');
                    let jsonstring = require(path.join(__dirname, '../', `/license${user}.json`));
                    license = +jsonstring.split(':')[1];
                    output = output + " " + Number(license);
                    netscore += Number(license) * .20;
                }
                catch (error) {
                    console.error(error);
                }
                netscore = Math.round(netscore * 100) / 100;
                netscores.push(netscore);
                outputStrings.push(URL + " " + netscore.toString() + output);
            }
            else {
                netscores.push(-1);
                outputStrings.push(URL + ": -1, Can only accept github URLs.");
            }
        }
        let finalOutputStrings = sortOutput(outputStrings, netscores);
        var json = [];
        for (let i = 0; i < finalOutputStrings.length; i++) {
            let stringgie = finalOutputStrings[i].split(" ");
            console.log(`${stringgie[0]} ${stringgie[1]} ${stringgie[2]} ${stringgie[3]} ${stringgie[4]} ${stringgie[5]} ${stringgie[6]}`);
            let temp = JSON.stringify({ URL: stringgie[0],
                NET_SCORE: Number(stringgie[1]),
                RAMP_UP_SCORE: Number(stringgie[2]),
                CORRECTNESS_SCORE: Number(stringgie[3]),
                BUS_FACTOR_SCORE: Number(stringgie[4]),
                RESPONSIVE_MAINTAINER_SCORE: Number(stringgie[5]),
                LICENSE_SCORE: Number(stringgie[6]) });
            json.push(temp);
        }
    });
}
main();
//# sourceMappingURL=hello-world.js.map