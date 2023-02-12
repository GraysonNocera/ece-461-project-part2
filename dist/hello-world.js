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
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let data = getData();
        let wordList = cleanData(data);
        console.log('URL NET_SCORE RAMP_UP_SCORE CORRECTNESS_SCORE BUS_FACTOR_SCORE RESPONSIVE_MAINTAINER_SCORE LICENSE_SCORE');
        for (let i = 0; i < wordList.length; i++) {
            let website = wordList[i].split('/')[0];
            let user = wordList[i].split('/')[1];
            let repo = wordList[i].split('/')[2];
            var downloads = 0;
            var issues = 0;
            var forks = 0;
            var pulls = 0;
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
                    output = output + " " + downloads;
                    netscore += Number(downloads);
                }
                catch (error) {
                    console.error(error);
                }
                try {
                    yield runPythonScript("get_issues", user, repo);
                    const path = require('path');
                    let jsonstring = require(path.join(__dirname, '../', `/issues${user}.json`));
                    issues = +jsonstring.split(':')[1];
                    output = output + " " + issues;
                    netscore += Number(issues);
                }
                catch (error) {
                    console.error(error);
                }
                try {
                    yield runPythonScript("get_forks", user, repo);
                    const path = require('path');
                    let jsonstring = require(path.join(__dirname, '../', `/forks${user}.json`));
                    forks = +jsonstring.split(':')[1];
                    netscore += Number(forks);
                    output = output + " " + forks;
                }
                catch (error) {
                    console.error(error);
                }
                try {
                    yield runPythonScript("get_pulls", user, repo);
                    const path = require('path');
                    let jsonstring = require(path.join(__dirname, '../', `/pulls${user}.json`));
                    pulls = +jsonstring.split(':')[1];
                    netscore += Number(pulls);
                    output = output + " " + pulls;
                }
                catch (error) {
                    console.error(error);
                }
                try {
                    yield runPythonScript("get_license", user, repo);
                    const path = require('path');
                    let jsonstring = require(path.join(__dirname, '../', `/license${user}.json`));
                    license = +jsonstring.split(':')[1];
                    netscore += Number(license);
                    output = output + " " + license;
                }
                catch (error) {
                    console.error(error);
                }
            }
            else {
                console.log("Can only accept github URLs.");
            }
            console.log(URL + " " + netscore.toString() + output);
        }
    });
}
main();
//# sourceMappingURL=hello-world.js.map