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
function runPythonScript(argument) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const process = spawn("python3", ["metrics.py", argument]);
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
            console.log(wordList[i]);
            let user = wordList[i].split('/')[1];
            let repo = wordList[i].split('/')[1];
            console.log(user);
            console.log(repo);
            var downloads = 0;
            var issues = 0;
            var contributors = 0;
            var collaborators = 0;
            var has_downloads = 0;
            var pulls = 0;
            var license = 0;
            try {
                yield runPythonScript("get_downloads");
                const path = require('path');
                let jsonstring = require(path.join(__dirname, '../', '/downloads.json'));
                console.log(jsonstring);
                var downloads = +jsonstring.charAt(jsonstring.length - 1);
                console.log((downloads * 2).toString());
            }
            catch (error) {
                console.error(error);
            }
            try {
                yield runPythonScript("get_issues");
                const path = require('path');
                let jsonstring = require(path.join(__dirname, '../', '/issues.json'));
                console.log(jsonstring);
                var issues = +jsonstring.charAt(jsonstring.length - 1);
                console.log((issues * 2).toString());
            }
            catch (error) {
                console.error(error);
            }
            try {
                yield runPythonScript("get_collaborators");
                const path = require('path');
                let jsonstring = require(path.join(__dirname, '../', '/collaborators.json'));
                console.log(jsonstring);
                var collaborators = +jsonstring.charAt(jsonstring.length - 1);
                console.log((collaborators * 2).toString());
            }
            catch (error) {
                console.error(error);
            }
            try {
                yield runPythonScript("get_contributors");
                const path = require('path');
                let jsonstring = require(path.join(__dirname, '../', '/contributors.json'));
                console.log(jsonstring);
                var contributors = +jsonstring.charAt(jsonstring.length - 1);
                console.log((contributors * 2).toString());
            }
            catch (error) {
                console.error(error);
            }
            try {
                yield runPythonScript("has_downloads");
                const path = require('path');
                let jsonstring = require(path.join(__dirname, '../', '/has_downloads.json'));
                console.log(jsonstring);
                var has_downloads = +jsonstring.charAt(jsonstring.length - 1);
                console.log((has_downloads * 2).toString());
            }
            catch (error) {
                console.error(error);
            }
            try {
                yield runPythonScript("get_pulls");
                const path = require('path');
                let jsonstring = require(path.join(__dirname, '../', '/pulls.json'));
                console.log(jsonstring);
                var pulls = +jsonstring.charAt(jsonstring.length - 1);
                console.log((pulls * 2).toString());
            }
            catch (error) {
                console.error(error);
            }
            try {
                yield runPythonScript("get_license");
                const path = require('path');
                let jsonstring = require(path.join(__dirname, '../', '/license.json'));
                console.log(jsonstring);
                var license = +jsonstring.charAt(jsonstring.length - 1);
                console.log((license * 2).toString());
            }
            catch (error) {
                console.error(error);
            }
        }
    });
}
main();
//# sourceMappingURL=hello-world.js.map