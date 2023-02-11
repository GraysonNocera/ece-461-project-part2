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
            let user = wordList[i].split('/')[1];
            let repo = wordList[i].split('/')[2];
            var downloads = 0;
            var issues = 0;
            var contributors = 0;
            var collaborators = 0;
            var has_downloads = 0;
            var pulls = 0;
            var license = 0;
            try {
                yield runPythonScript("get_downloads", user, repo);
                const path = require('path');
                let jsonstring = require(path.join(__dirname, '../', '/downloads.json'));
                console.log(jsonstring);
                downloads = +jsonstring.split(':')[1];
                console.log((downloads * 2).toString());
            }
            catch (error) {
                console.error(error);
            }
            try {
                yield runPythonScript("get_issues", user, repo);
                const path = require('path');
                let jsonstring = require(path.join(__dirname, '../', '/issues.json'));
                console.log(jsonstring);
                issues = +jsonstring.split(':')[1];
                console.log((issues * 2).toString());
            }
            catch (error) {
                console.error(error);
            }
            try {
                yield runPythonScript("get_collaborators", user, repo);
                const path = require('path');
                let jsonstring = require(path.join(__dirname, '../', '/collaborators.json'));
                console.log(jsonstring);
                collaborators = +jsonstring.split(':')[1];
                console.log((collaborators * 2).toString());
            }
            catch (error) {
                console.error(error);
            }
            try {
                yield runPythonScript("get_contributors", user, repo);
                const path = require('path');
                let jsonstring = require(path.join(__dirname, '../', '/contributors.json'));
                console.log(jsonstring);
                contributors = +jsonstring.split(':')[1];
                console.log((contributors * 2).toString());
            }
            catch (error) {
                console.error(error);
            }
            try {
                yield runPythonScript("has_downloads", user, repo);
                const path = require('path');
                let jsonstring = require(path.join(__dirname, '../', '/has_downloads.json'));
                console.log(jsonstring);
                has_downloads = +jsonstring.split(':')[1];
                console.log((has_downloads * 2).toString());
            }
            catch (error) {
                console.error(error);
            }
            try {
                yield runPythonScript("get_pulls", user, repo);
                const path = require('path');
                let jsonstring = require(path.join(__dirname, '../', '/pulls.json'));
                console.log(jsonstring);
                pulls = +jsonstring.split(':')[1];
                console.log((pulls * 2).toString());
            }
            catch (error) {
                console.error(error);
            }
            try {
                yield runPythonScript("get_license", user, repo);
                const path = require('path');
                let jsonstring = require(path.join(__dirname, '../', '/license.json'));
                console.log(jsonstring);
                license = +jsonstring.split(':')[1];
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