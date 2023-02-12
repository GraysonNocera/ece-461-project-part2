const { spawn } = require("child_process");
import { readFileSync } from 'fs';

async function runPythonScript(argument: string, user: string, repo: string) {
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
}

function getData():string{
  // https://stackoverflow.com/questions/33643107/read-and-write-a-text-file-in-typescript
  // https://stackoverflow.com/questions/59178648/how-to-retrieve-command-line-args-which-was-passed-during-building-custom-build
  let Input: string = '';
  for(let i = 0; i < process.argv.slice(2).length; i++) {
    Input += process.argv.slice(2)[i] + ' ';
  }
  Input = Input.trim();
  const file = readFileSync(Input, 'utf-8');
  return file
}

function cleanData(data):string[]{
  const wordList = data.split('\n');
  // console.log(wordList)
  //https://www.tutorialsteacher.com/typescript/for-loop\
  for (let i = 0; i < wordList.length; i++) {
    wordList[i] = wordList[i].replace("https://", "").replace("www.", "").replace(".com", "");
  }
  return wordList
}

async function main() {
let data = getData();
// console.log(data);
let wordList = cleanData(data);
console.log('URL NET_SCORE RAMP_UP_SCORE CORRECTNESS_SCORE BUS_FACTOR_SCORE RESPONSIVE_MAINTAINER_SCORE LICENSE_SCORE');

for(let i = 0; i < wordList.length; i++){
  // let netscore = 0;
  // console.log(wordList[i]);

  let website: string = wordList[i].split('/')[0];
  let user: string = wordList[i].split('/')[1];
  let repo: string = wordList[i].split('/')[2];

  // console.log(website);
  // console.log(user);
  // console.log(repo);

  var downloads: number = 0;
  var issues: number = 0;
  var forks: number = 0;
  var license: number = 0;
  if(website == "github"){
    try {
      await runPythonScript("get_downloads", user, repo);
      // console.log(`${result}`);
      const path = require('path');
      let jsonstring: string  = require(path.join(__dirname,'../','/downloads.json'));
      console.log(jsonstring);
      downloads = +jsonstring.split(':')[1];
      console.log((downloads*2).toString());
    } catch (error) {
      console.error(error);
    }
    try {
      await runPythonScript("get_issues", user, repo);
      // console.log(`${result}`);
      const path = require('path');
      let jsonstring: string  = require(path.join(__dirname,'../','/issues.json'));
      console.log(jsonstring);
      issues = +jsonstring.split(':')[1];
      console.log((issues*2).toString());
    } catch (error) {
      console.error(error);
    }
  
    try {
      await runPythonScript("get_forks", user, repo);
      // console.log(`${result}`);
      const path = require('path');
      let jsonstring: string  = require(path.join(__dirname,'../','/forks.json'));
      console.log(jsonstring);
      forks = +jsonstring.split(':')[1];
      console.log((forks*2).toString());
    } catch (error) {
      console.error(error);
    }
  
    try {
      await runPythonScript("get_license", user, repo);
      // console.log(`${result}`);
      const path = require('path');
      let jsonstring: string  = require(path.join(__dirname,'../','/license.json'));
      console.log(jsonstring);
      license = +jsonstring.split(':')[1];
      console.log((license*2).toString());
    } catch (error) {
      console.error(error);
    }
  }
  else{
    console.log("Can only accept github URLs.");

  }
  }
}

main();