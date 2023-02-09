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
            const process = spawn("python", ["dummy.py", argument]);
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
    console.log(wordList);
    for (let i = 0; i < wordList.length; i++) {
        wordList[i] = wordList[i].replace("https://", "").replace("www.", "").replace(".com", "");
    }
    return wordList;
}
function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = 0;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let data = getData();
        let wordList = cleanData(data);
        console.log(wordList);
        for (var word in wordList) {
            console.log(word);
            try {
                yield runPythonScript("get_downloads");
                const path = require('path');
                sleep(2000);
                let jsonstring = require(path.join(__dirname, '../', '/pyout.json'));
                console.log(jsonstring);
                var val = +jsonstring.charAt(jsonstring.length - 1);
                console.log((val * 2).toString());
            }
            catch (error) {
                console.error(error);
            }
            try {
                yield runPythonScript("get_issues");
                const path = require('path');
                sleep(2000);
                let jsonstring = require(path.join(__dirname, '../', '/pyout.json'));
                console.log(jsonstring);
                var val = +jsonstring.charAt(jsonstring.length - 1);
                console.log((val * 2).toString());
            }
            catch (error) {
                console.error(error);
            }
            try {
                yield runPythonScript("get_collaborators");
                const path = require('path');
                sleep(2000);
                let jsonstring = require(path.join(__dirname, '../', '/pyout.json'));
                console.log(jsonstring);
                var val = +jsonstring.charAt(jsonstring.length - 1);
                console.log((val * 2).toString());
            }
            catch (error) {
                console.error(error);
            }
            try {
                yield runPythonScript("get_contributors");
                const path = require('path');
                sleep(2000);
                let jsonstring = require(path.join(__dirname, '../', '/pyout.json'));
                console.log(jsonstring);
                var val = +jsonstring.charAt(jsonstring.length - 1);
                console.log((val * 2).toString());
                console.log((val * 2).toString());
            }
            catch (error) {
                console.error(error);
            }
            try {
                yield runPythonScript("has_downloads");
                const path = require('path');
                sleep(2000);
                let jsonstring = require(path.join(__dirname, '../', '/pyout.json'));
                console.log(jsonstring);
                var val = +jsonstring.charAt(jsonstring.length - 1);
                console.log((val * 2).toString());
            }
            catch (error) {
                console.error(error);
            }
            try {
                yield runPythonScript("get_pulls");
                const path = require('path');
                sleep(2000);
                let jsonstring = require(path.join(__dirname, '../', '/pyout.json'));
                console.log(jsonstring);
                var val = +jsonstring.charAt(jsonstring.length - 1);
                console.log((val * 2).toString());
            }
            catch (error) {
                console.error(error);
            }
            try {
                yield runPythonScript("get_license");
                const path = require('path');
                sleep(2000);
                let jsonstring = require(path.join(__dirname, '../', '/pyout.json'));
                console.log(jsonstring);
                var val = +jsonstring.charAt(jsonstring.length - 1);
                console.log((val * 2).toString());
            }
            catch (error) {
                console.error(error);
            }
        }
    });
}
main();
//# sourceMappingURL=hello-world.js.map