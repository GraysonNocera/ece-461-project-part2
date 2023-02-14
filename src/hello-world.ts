const { spawn } = require("child_process");
import { readFileSync } from 'fs';
const jq = require('node-jq');
var stream = require('stream');
const ndjson = require('ndjson')


interface URLOBJ{
  URL: string
  NET_SCORE: number
  RAMP_UP_SCORE: number 
  CORRECTNESS_SCORE: number 
  BUS_FACTOR_SCORE: number
  RESPONSIVE_MAINTAINER_SCORE: number 
  LICENSE_SCORE: number
}

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

function sortOutput(output, netscores):string[]{
  var finalOutput: string[] = [];
  let sorted = [...netscores].sort(function(a, b){return a - b}).reverse();
  for(var val of sorted){
    let index = 0
    for(let i = 0; i < netscores.length; i++){
      if(val == netscores[i]){
        index = i
        break
      }
    }
    finalOutput.push(output[index]);
    netscores[index] = -2
  }
  return finalOutput
}

async function main() {
  var objs: URLOBJ[] = [];

  let data = getData();
  // console.log(data);
  let wordList = cleanData(data);
  console.log('URL NET_SCORE RAMP_UP_SCORE CORRECTNESS_SCORE BUS_FACTOR_SCORE RESPONSIVE_MAINTAINER_SCORE LICENSE_SCORE');
  var netscores:Array<number> = [];
  var outputStrings:Array<string> = [];


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
    var contributors: number = 0;
    var license: number = 0;
    
    let URL = data.split("\n")[i];
    let output = "";
    let netscore = 0;
    // console.log(output)
    if(website == "github"){
      try {
        await runPythonScript("get_downloads", user, repo);
        // console.log(`${result}`);
        const path = require('path');
        let jsonstring: string  = require(path.join(__dirname,'../',`/downloads${user}.json`));
        // console.log(jsonstring);
        downloads = +jsonstring.split(':')[1];

        let temp = 0;
        if(Number(downloads) == null || Number(downloads) < 100){
          temp = 0
        }
        else if(Number(downloads)>100 && Number(downloads)<200){
          temp = .5
        }
        else{
          temp = 1
        }
        output = output + " " + temp;
        netscore += Math.round(temp*.25* 100) / 100;

      } catch (error) {
        console.error(error);
      }
      try {
        await runPythonScript("get_issues", user, repo);
        // console.log(`${result}`);
        const path = require('path');
        let jsonstring: string  = require(path.join(__dirname,'../',`/issues${user}.json`));
        // console.log(jsonstring);`
        issues = +jsonstring.split(':')[1];
        
        let temp = 0;
        if(Number(issues) == null || Number(issues) < 100){
          temp = 0
        }
        else if(Number(issues)>100 && Number(issues)<200){
          temp = .5
        }
        else{
          temp = 1
        }
        output = output + " " + temp;
        netscore += Math.round(temp*.20* 100) / 100;
      } catch (error) {
        console.error(error);
      }

      try {
        await runPythonScript("get_contributors", user, repo);
        // console.log(`${result}`);
        const path = require('path');
        let jsonstring: string  = require(path.join(__dirname,'../',`/contributors${user}.json`));
        // console.log(jsonstring);
        contributors = +jsonstring.split(':')[1];

        let temp = 0;
        if(Number(contributors) == null || Number(contributors) < 10){
          temp = 0
        }
        else if(Number(contributors)>10 && Number(contributors)<20){
          temp = .5
        }
        else{
          temp = 1
        }
        output = output + " " + temp;
        netscore += Math.round(temp*.25* 100) / 100;
        
        // console.log((forks*2).toString());
      } catch (error) {
        console.error(error);
      }

      try {
        await runPythonScript("get_forks", user, repo);
        // console.log(`${result}`);
        const path = require('path');
        let jsonstring: string  = require(path.join(__dirname,'../',`/forks${user}.json`));
        // console.log(jsonstring);
        forks = +jsonstring.split(':')[1];
        
        let temp = 0;
        if(Number(forks) == null || Number(forks) < 100){
          temp = 0
        }
        else if(Number(forks)>100 && Number(forks)<200){
          temp = .5
        }
        else{
          temp = 1
        }
        output = output + " " + temp;
        netscore += Math.round(temp*.1* 100) / 100;
      } catch (error) {
        console.error(error);
      }
    
      try {
        await runPythonScript("get_license", user, repo);
        // console.log(`${result}`);
        const path = require('path');
        let jsonstring: string  = require(path.join(__dirname,'../',`/license${user}.json`));
        // console.log(jsonstring);
        license = +jsonstring.split(':')[1];
        
        let temp = 0;
        if(Number(license) == null || Number(license) < 100){
          temp = 0
        }
        else if(Number(license)>100 && Number(license)<200){
          temp = .5
        }
        else{
          temp = 1
        }
        output = output + " " + temp;
        netscore += Math.round(temp*.20* 100) / 100;
      } catch (error) {
        console.error(error);
      }
      // console.log(URL + " " + netscore.toString() + output)
      netscores.push(netscore)
      outputStrings.push(URL + " " + netscore.toString() + output)

    }
    else{
      // console.log(URL + ": -1, Can only accept github URLs.");
      netscores.push(-1)
      outputStrings.push(URL + ": -1, Can only accept github URLs.")
    }
    }
    // console.log(netscores.sort(function(a, b){return a - b}).reverse())
    let finalOutputStrings = sortOutput(outputStrings, netscores);
    // console.log(finalOutputStrings)

    var json: string[] = [];
    for(let i = 0; i < finalOutputStrings.length; i++){
      let stringgie = finalOutputStrings[i].split(" ")
      console.log(`${stringgie[0]} ${stringgie[1]} ${stringgie[2]} ${stringgie[3]} ${stringgie[4]} ${stringgie[5]} ${stringgie[6]}`)
      let temp = JSON.stringify({URL: stringgie[0], 
                  NET_SCORE: Number(stringgie[1]), 
                  RAMP_UP_SCORE: Number(stringgie[2]), 
                  CORRECTNESS_SCORE: Number(stringgie[3]), 
                  BUS_FACTOR_SCORE: Number(stringgie[4]), 
                  RESPONSIVE_MAINTAINER_SCORE: Number(stringgie[5]), 
                  LICENSE_SCORE: Number(stringgie[6])})
      json.push(temp)
    }

    // console.log(json)

}

main();