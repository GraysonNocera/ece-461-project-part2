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



async function main() {
  try {
    const result = await runPythonScript("has_downloads");
    console.log(`${result}`);
    var val: number = Number(result)
    console.log((val*2).toString())
  } catch (error) {
    console.error(error);
  }

  // https://stackoverflow.com/questions/33643107/read-and-write-a-text-file-in-typescript
  const file = readFileSync('/Users/haleyhuntington/Desktop/Project-1/Sample IO/Sample Url File.txt', 'utf-8');
  // console.log(file)

  const wordList = file.split('\n');
  // console.log(wordList)

  //https://www.tutorialsteacher.com/typescript/for-loop\
  for (let i = 0; i < wordList.length; i++) {
    wordList[i] = wordList[i].replace("https://", "").replace("www.", "").replace(".com", "");
  }
  console.log(wordList)
}

main();
