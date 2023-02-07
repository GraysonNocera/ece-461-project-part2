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
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield runPythonScript("has_downloads");
            console.log(`${result}`);
            var val = Number(result);
            console.log((val * 2).toString());
        }
        catch (error) {
            console.error(error);
        }
        const file = (0, fs_1.readFileSync)('/Users/haleyhuntington/Desktop/Project-1/Sample IO/Sample Url File.txt', 'utf-8');
        const wordList = file.split('\n');
        for (let i = 0; i < wordList.length; i++) {
            wordList[i] = wordList[i].replace("https://", "").replace("www.", "").replace(".com", "");
        }
        console.log(wordList);
    });
}
main();
//# sourceMappingURL=hello-world.js.map