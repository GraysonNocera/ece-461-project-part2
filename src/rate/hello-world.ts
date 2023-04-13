import { readFileSync, writeFile } from "fs";
import { emptyDirSync } from "fs-extra";
import * as cp from "child_process";
const { spawn } = require("child_process");
import { graphAPIfetch, gql_query } from "./graphql_json";
// const jq = require("node-jq");
// var stream = require("stream");
// const ndjson = require("ndjson");

interface URLOBJ {
  URL: string;
  NET_SCORE: number;
  PINNING_SCORE: number;
  RAMP_UP_SCORE: number;
  CORRECTNESS_SCORE: number;
  BUS_FACTOR_SCORE: number;
  RESPONSIVE_MAINTAINER_SCORE: number;
  LICENSE_SCORE: number;
  ENGR_SCORE: number;
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

function getData(): string {
  // https://stackoverflow.com/questions/33643107/read-and-write-a-text-file-in-typescript
  // https://stackoverflow.com/questions/59178648/how-to-retrieve-command-line-args-which-was-passed-during-building-custom-build
  let Input = "";
  for (let i = 0; i < process.argv.slice(2).length; i++) {
    Input += process.argv.slice(2)[i] + " ";
  }
  Input = Input.trim();
  const file = readFileSync(Input, "utf-8");
  return file;
}

function cleanData(data): string[] {
  const wordList = data.split("\n");
  // console.log(wordList)
  //https://www.tutorialsteacher.com/typescript/for-loop\
  for (let i = 0; i < wordList.length; i++) {
    wordList[i] = wordList[i]
      .replace("https://", "")
      .replace("www.", "")
      .replace(".com", "");
  }
  return wordList;
}

function sortOutput(output, netscores): string[] {
  const finalOutput: string[] = [];
  const sorted = [...netscores]
    .sort(function (a, b) {
      return a - b;
    })
    .reverse();
  for (const val of sorted) {
    let index = 0;
    for (let i = 0; i < netscores.length; i++) {
      if (val == netscores[i]) {
        index = i;
        break;
      }
    }
    finalOutput.push(output[index]);
    netscores[index] = -2;
  }
  return finalOutput;
}

async function main() {
  //   var objs: URLOBJ[] = [];
  let data = process.argv[2];
  if (data.includes(".txt")) {
    data = getData();
  }
  // let data = getData();
  // console.log(data);
  const wordList = cleanData(data);
  console.log(
    "URL NET_SCORE VERSION_PINNING_SCORE RAMP_UP_SCORE CORRECTNESS_SCORE BUS_FACTOR_SCORE RESPONSIVE_MAINTAINER_SCORE LICENSE_SCORE ENGR_SCORE"
  );
  const netscores: Array<number> = [];
  const outputStrings: Array<string> = [];

  for (let i = 0; i < wordList.length; i++) {
    // let netscore = 0;
    // console.log(wordList[i]);

    const website: string = wordList[i].split("/")[0];
    let user: string = wordList[i].split("/")[1];
    let repo: string = wordList[i].split("/")[2];

    // downloads was unused at the time the linter was implemented.
    // uncomment if downloads is later used
    // var downloads: number = 0;
    let pinned = 0;
    let issues = 0;
    let forks = 0;
    let contributors = 0;
    let license = 0;
    let engr = 0;

    const URL = data.split("\n")[i];
    let output = "";
    let netscore = 0;

    if (website == "npmjs") {
      //find github url and update user and repo values to be able to run code
      const run: string = "npm view " + repo + " repository.url";
      const result: string = cp.execSync(run).toString();
      user = result.split("/")[3];
      repo = result.split("/")[4].replace(".git", "");
      repo = repo.replace("\n", "");
    }
    if (website == "github" || website == "npmjs") {
      //is url valid
      try {
        await runPythonScript("get_clone", user, repo);
      } catch (error) {
        console.error(error);
      }
      try {
        const gql: string = gql_query(user, repo);
        await graphAPIfetch(gql, repo);
        // await runPythonScript("get_graph", user, repo);
      } catch (error) {
        console.error(error);
      }
      try {
        await runPythonScript("get_pinned", user, repo);
        //function for getting version pinned dependencies
        const path = require("path");
        const jsonstring: string = require(path.join(
          __dirname,
          // "../",
          `/jsons/pinned${user}.json`
        ));

        pinned = +jsonstring.split(":")[1];

        let temp = 0;

        //epic typescript notation basically I'm taking a number casting it to number again, not sure why but everywhere else does it
        //then I am converting it to 2 decimal places and the plus sign converts it back to a number
        temp = +Number(pinned).toFixed(2);
        output = output + " " + temp;
        netscore += temp * 0.1;
      } catch (error) {
        console.error(error);
      }

      try {
        // await runPythonScript("get_downloads", user, repo);
        // console.log(`${result}`);
        let repo_2: string = repo;
        // .system("cloc --by-percent cm --sum-one --yaml " + repo)
        repo_2 = '"' + repo + '"'; // prep directory for cloc command
        const terminal_command: string =
          "cloc --by-percent cm --sum-one --yaml " + repo_2;

        // Run terminal output and convert to string
        let terminal_output: Buffer;
        try {
          terminal_output = cp.execSync(terminal_command);
          let data: string = terminal_output.toString();
          // Get pecentage of repo that is comments
          let percent = 0;

          // Get the part of the result after SUM
          let re = new RegExp("SUM", "i");
          data = data.substring(data.search(re), data.length);

          // Get total comment percentage
          re = new RegExp("comment:", "i");
          const loc: number = data.search(re);
          if (!loc) {
            percent = 0;
          }
          data = data.substring(loc + "comment: ".length, data.length);
          percent = parseFloat(data.split("\n")[0]);
          output = output + " " + percent / 100;
          netscore += (percent / 100) * 0.2;
        } catch (err) {
          console.error(err);
        }
      } catch (error) {
        console.error(error);
      }
      try {
        await runPythonScript("get_issues", user, repo);
        // console.log(`${result}`);
        const path = require("path");
        const jsonstring: string = require(path.join(
          __dirname,
          `/jsons/issues${user}.json`
        ));
        // console.log(jsonstring);`
        issues = +jsonstring.split(":")[1];

        let temp = 0;
        if (Number(issues) == null || Number(issues) < 100) {
          temp = 0;
        } else if (Number(issues) > 100 && Number(issues) < 200) {
          temp = 0.5;
        } else {
          temp = 1;
        }
        output = output + " " + temp;
        netscore += temp * 0.2;
      } catch (error) {
        console.error(error);
      }

      try {
        await runPythonScript("get_contributors", user, repo);
        // console.log(`${result}`);
        const path = require("path");
        const jsonstring: string = require(path.join(
          __dirname,
          // "../",
          `/jsons/contributors${user}.json`
        ));
        // console.log(jsonstring);
        contributors = +jsonstring.split(":")[1];

        let temp = 0;
        if (Number(contributors) == null || Number(contributors) < 10) {
          temp = 0;
        } else if (Number(contributors) > 10 && Number(contributors) < 20) {
          temp = 0.5;
        } else {
          temp = 1;
        }
        output = output + " " + temp;
        netscore += temp * 0.15;

        // console.log((forks*2).toString());
      } catch (error) {
        console.error(error);
      }

      try {
        await runPythonScript("get_forks", user, repo);
        // console.log(`${result}`);
        const path = require("path");
        const jsonstring: string = require(path.join(
          __dirname,
          // "../",
          `/jsons/forks${user}.json`
        ));
        // console.log(jsonstring);
        forks = +jsonstring.split(":")[1];
        let temp = 0;
        if (Number(forks) == null || Number(forks) < 100) {
          temp = 0;
        } else if (Number(forks) > 100 && Number(forks) < 200) {
          temp = 0.5;
        } else {
          temp = 1;
        }
        output = output + " " + temp;
        netscore += temp * 0.1;
      } catch (error) {
        console.error(error);
      }

      try {
        await runPythonScript("get_license", user, repo);
        // console.log(`${result}`);
        const path = require("path");
        const jsonstring: string = require(path.join(
          __dirname,
          // "../",
          `/jsons/license${user}.json`
        ));
        // console.log(jsonstring);
        license = +jsonstring.split(":")[1];
        output = output + " " + Number(license);
        netscore += Number(license) * 0.2;
      } catch (error) {
        console.error(error);
      }

      try {
        await runPythonScript("get_engr", user, repo);
        // console.log(`${result}`);
        const path = require("path");
        const jsonstring: string = require(path.join(
          __dirname,
          // "../",
          // "../",
          `/jsons/engr${user}.json`
        ));
        // console.log(jsonstring);
        engr = +jsonstring.split(":")[1];
        const temp: number = +Number(engr).toFixed(2);
        output = output + " " + temp;
        netscore += temp * 0.1;
      } catch (error) {
        console.error(error);
      }

      try {
        await runPythonScript("rm_repo", user, repo);
      } catch (error) {
        console.error(error);
      }
      // console.log(URL + " " + netscore.toString() + output)
      netscore = Math.round(netscore * 100) / 100;
      netscores.push(netscore);
      outputStrings.push(URL + " " + netscore.toString() + output);
    } else {
      // console.log(URL + ": -1, Can only accept github URLs.");
      netscores.push(-1);
      outputStrings.push(
        URL + ": -1, Can only accept github URLs or npm URLs."
      );
      netscore = Math.round(netscore * 100) / 100;
      netscores.push(netscore);
      outputStrings.push(URL + " " + netscore.toString() + output);
    }
  }
  // console.log(netscores.sort(function(a, b){return a - b}).reverse())
  const finalOutputStrings = sortOutput(outputStrings, netscores);
  // console.log(finalOutputStrings);

  emptyDirSync("src/rate/jsons/");

  const json: string[] = [];
  for (let i = 0; i < finalOutputStrings.length; i++) {
    const stringgie = finalOutputStrings[i].split(" ");
    // console.log(
    //   `${stringgie[0]} ${stringgie[1]} ${stringgie[2]} ${stringgie[3]} ${stringgie[4]} ${stringgie[5]} ${stringgie[6]} ${stringgie[7]} ${stringgie[8]}`
    // );
    const temp = JSON.stringify({
      //URL: Number(stringgie[0]),
      NetScore: !Number.isNaN(Number(stringgie[2])) ? Number(stringgie[2]) : -1,
      BusFactor: !Number.isNaN(Number(stringgie[5]))
        ? Number(stringgie[5])
        : -1,
      Correctness: !Number.isNaN(Number(stringgie[4]))
        ? Number(stringgie[4])
        : -1,
      RampUp: !Number.isNaN(Number(stringgie[3])) ? Number(stringgie[3]) : -1,
      ResponsiveMaintainer: !Number.isNaN(Number(stringgie[6]))
        ? Number(stringgie[6])
        : -1,
      LicenseScore: !Number.isNaN(Number(stringgie[7]))
        ? Number(stringgie[7])
        : -1,
      GoodPinningPractice: !Number.isNaN(Number(stringgie[1]))
        ? Number(stringgie[1])
        : -1,
      GoodEngineeringPractice: !Number.isNaN(Number(stringgie[8]))
        ? Number(stringgie[8])
        : -1,
    });
    writeFile(__dirname + "/score.json", temp, function (err) {
      if (err) throw err;
      //console.log("complete");
    });
  }

  // console.log(json)
}

main();
