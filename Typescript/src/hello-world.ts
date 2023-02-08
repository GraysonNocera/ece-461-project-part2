const { spawn } = require("child_process");
import { readFileSync } from 'fs';

async function runPythonScript(argument: string) {
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
  console.log(wordList)
  //https://www.tutorialsteacher.com/typescript/for-loop\
  for (let i = 0; i < wordList.length; i++) {
    wordList[i] = wordList[i].replace("https://", "").replace("www.", "").replace(".com", "");
  }
  return wordList
}

async function main() {
let data = getData()
console.log(data)
let wordList = cleanData(data)
console.log(wordList)

for(var word in wordList){
  // let netscore = 0;
  console.log(word)
  // var 
  try {
    const result = await runPythonScript("get_downloads");
    console.log(`${result}`);
    var val: number = Number(result)
    console.log((val*2).toString())
  } catch (error) {
    console.error(error);
  }
  try {
    const result = await runPythonScript("get_issues");
    console.log(`${result}`);
    var val: number = Number(result)
    console.log((val*2).toString())
  } catch (error) {
    console.error(error);
  }


  try {
    const result = await runPythonScript("get_collaborators");
    console.log(`${result}`);
    var val: number = Number(result)
    console.log((val*2).toString())
  } catch (error) {
    console.error(error);
  }

  try {
    const result = await runPythonScript("get_contributors");
    console.log(`${result}`);
    var val: number = Number(result)
    console.log((val*2).toString())
  } catch (error) {
    console.error(error);
  }

  try {
    const result = await runPythonScript("has_downloads");
    console.log(`${result}`);
    var val: number = Number(result)
    console.log((val*2).toString())
  } catch (error) {
    console.error(error);
  }

  try {
    const result = await runPythonScript("get_pulls");
    console.log(`${result}`);
    var val: number = Number(result)
    console.log((val*2).toString())
  } catch (error) {
    console.error(error);
  }

  try {
    const result = await runPythonScript("get_license");
    console.log(`${result}`);
    var val: number = Number(result)
    console.log((val*2).toString())
  } catch (error) {
    console.error(error);
  }
}
}

main();
