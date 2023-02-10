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

  let user: string = wordList[i].split('/')[1];
  let repo: string = wordList[i].split('/')[2];

  // console.log(user);
  // console.log(repo);

  var downloads: number = 0;
  var issues: number = 0;
  var contributors: number = 0;
  var collaborators: number = 0;
  var has_downloads: number = 0;
  var pulls: number = 0;
  var license: number = 0;

  try {
    await runPythonScript("get_downloads", user, repo);
    // console.log(`${result}`);
    const path = require('path');
    let jsonstring: string  = require(path.join(__dirname,'../','/downloads.json'));
    console.log(jsonstring);
    downloads = +jsonstring.charAt(jsonstring.length - 1);
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
    issues = +jsonstring.charAt(jsonstring.length - 1);
    console.log((issues*2).toString());
  } catch (error) {
    console.error(error);
  }

  try {
    await runPythonScript("get_collaborators", user, repo);
    // console.log(`${result}`);
    const path = require('path');
    let jsonstring: string  = require(path.join(__dirname,'../','/collaborators.json'));
    console.log(jsonstring);
    collaborators = +jsonstring.charAt(jsonstring.length - 1);
    console.log((collaborators*2).toString());
  } catch (error) {
    console.error(error);
  }

  try {
    await runPythonScript("get_contributors", user, repo);
    // console.log(`${result}`);
    const path = require('path');
    let jsonstring: string  = require(path.join(__dirname,'../','/contributors.json'));
    console.log(jsonstring);
    contributors = +jsonstring.charAt(jsonstring.length - 1);
    console.log((contributors*2).toString());
  } catch (error) {
    console.error(error);
  }

  try {
    await runPythonScript("has_downloads", user, repo);
    // console.log(`${result}`);
    const path = require('path');
    let jsonstring: string  = require(path.join(__dirname,'../','/has_downloads.json'));
    console.log(jsonstring);
    has_downloads = +jsonstring.charAt(jsonstring.length - 1);
    console.log((has_downloads*2).toString());
  } catch (error) {
    console.error(error);
  }

  try {
    await runPythonScript("get_pulls", user, repo);
    // console.log(`${result}`);
    const path = require('path');
    let jsonstring: string  = require(path.join(__dirname,'../','/pulls.json'));
    console.log(jsonstring);
    var pulls: number = +jsonstring.charAt(jsonstring.length - 1);
    console.log((pulls*2).toString());
  } catch (error) {
    console.error(error);
  }

  try {
    await runPythonScript("get_license", user, repo);
    // console.log(`${result}`);
    const path = require('path');
    let jsonstring: string  = require(path.join(__dirname,'../','/license.json'));
    console.log(jsonstring);
    license = +jsonstring.charAt(jsonstring.length - 1);
    console.log((license*2).toString());
  } catch (error) {
    console.error(error);
  }
  }

}

main();