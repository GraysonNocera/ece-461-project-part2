import { readFileSync, writeFile } from "fs";
import { emptyDirSync } from "fs-extra";
import * as cp from "child_process";
const { spawn } = require("child_process");
import { graphAPIfetch, gql_query } from "./graphql_json";
import { logger } from "../logging";
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
  let Input: string = "";
  for (let i = 0; i < process.argv.slice(2).length; i++) {
    Input += process.argv.slice(2)[i] + " ";
  }
  Input = Input.trim();
  const file = readFileSync(Input, "utf-8");
  return file;
}

function cleanData(data): string[] {
  const wordList = data.split("\n");
  // logger.log(wordList)
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
  var finalOutput: string[] = [];
  let sorted = [...netscores]
    .sort(function (a, b) {
      return a - b;
    })
    .reverse();
  for (var val of sorted) {
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
  logger.info("Running rate script...")

  //   var objs: URLOBJ[] = [];
  let data = process.argv[2];
  if (data.includes(".txt")) {
    data = getData();
  }
  // let data = getData();
  // logger.log(data);
  let wordList = cleanData(data);
  var netscores: Array<number> = [];
  var outputStrings: Array<string> = [];

  for (let i = 0; i < wordList.length; i++) {
    // let netscore = 0;
    // logger.log(wordList[i]);

    let website: string = wordList[i].split("/")[0];
    let user: string = wordList[i].split("/")[1];
    let repo: string = wordList[i].split("/")[2];

    // downloads was unused at the time the linter was implemented.
    // uncomment if downloads is later used
    // var downloads: number = 0;
    var pinned: number = 0;
    var issues: number = 0;
    var forks: number = 0;
    var contributors: number = 0;
    var license: number = 0;
    var engr: number = 0;

    let URL = data.split("\n")[i];
    let output = "";
    let netscore = 0;

    if (website == "npmjs") {
      //find github url and update user and repo values to be able to run code
      let run: string = "npm view " + repo + " repository.url";
      let result: string = cp.execSync(run).toString();
      user = result.split("/")[3];
      repo = result.split("/")[4].replace(".git", "");
      repo = repo.replace("\n", "");
    }

    if (website == "github" || website == "npmjs") {
      //is url valid
      try {
        await runPythonScript("get_clone", user, repo);
      } catch (error) {
        logger.error(error);
      }
      try {
        let gql: string = gql_query(user, repo);
        await graphAPIfetch(gql, repo);
        // await runPythonScript("get_graph", user, repo);
      } catch (error) {
        logger.error(error);
      }
      try {
        logger.info("Rate: Getting pinned metric...")
        await runPythonScript("get_pinned", user, repo);
        //function for getting version pinned dependencies
        const path = require("path");
        let jsonstring: string = require(path.join(
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

        netscore += Math.min(temp, 1) * 0.1;

        logger.info("Rate: got pinned metric of " + temp + " for " + repo + "and netscore is " + netscore);
      } catch (error) {
        logger.error(error);
      }

      try {

        logger.info("Rate: Getting percentage of comments...")

        // await runPythonScript("get_downloads", user, repo);
        // logger.log(`${result}`);
        let repo_2: string = repo;
        // .system("cloc --by-percent cm --sum-one --yaml " + repo)
        repo_2 = '"' + repo + '"'; // prep directory for cloc command
        let terminal_command: string =
          "cloc --by-percent cm --sum-one --yaml " + repo_2;

        // Run terminal output and convert to string
        let terminal_output: Buffer;
        try {
          terminal_output = cp.execSync(terminal_command);
          let data: string = terminal_output.toString();
          // Get pecentage of repo that is comments
          let percent: number = 0;

          // Get the part of the result after SUM
          let re: RegExp = new RegExp("SUM", "i");
          data = data.substring(data.search(re), data.length);

          // Get total comment percentage
          re = new RegExp("comment:", "i");
          let loc: number = data.search(re);
          if (!loc) {
            percent = 0;
          }
          data = data.substring(loc + "comment: ".length, data.length);
          percent = parseFloat(data.split("\n")[0]);
          output = output + " " + Math.min(1, percent / 100 + 0.4);
          netscore += Math.min(1, percent / 100 + 0.4) * 0.2;

          logger.info(
            "Rate: got percentage of comments (ramp up) score of " +
              Math.min(1, percent / 100 + 0.4) +
              " with a percentage of " +
              percent +
              " and net score of " +
              netscore
          );
        } catch (err) {
          logger.error(err);
        }
      } catch (error) {
        logger.error(error);
      }
      try {
        logger.info("Rate: Getting issues metric (correctness)...")
        await runPythonScript("get_issues", user, repo);
        // logger.log(`${result}`);
        const path = require("path");
        let jsonstring: string = require(path.join(
          __dirname,
          `/jsons/issues${user}.json`
        ));
        // logger.log(jsonstring);`
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
        // netscore += temp * 0.2;
        netscore = Math.min(temp, 1) * 0.2;

        logger.info("Rate: Got issues (correctness) metric of " + temp + " and netscore of " + netscore);
      } catch (error) {
        logger.error(error);
      }

      try {
        logger.info("Rate: Getting contributors metric (bus factor)...")
        await runPythonScript("get_contributors", user, repo);
        // logger.log(`${result}`);
        const path = require("path");
        let jsonstring: string = require(path.join(
          __dirname,
          // "../",
          `/jsons/contributors${user}.json`
        ));
        // logger.log(jsonstring);
        contributors = +jsonstring.split(":")[1];

        let temp = 0;
        if (Number(contributors) == null || Number(contributors) < 5) {
          temp = 0;
        } else if (Number(contributors) > 5 && Number(contributors) < 25) {
          temp = 0.5;
        } else {
          temp = 1;
        }
        output = output + " " + temp;
        netscore += Math.min(temp, 1) * 0.15;
        // netscore += temp * 0.15;

        // logger.log((forks*2).toString());
        logger.info("Rate: Got contributors (bus factor) metric of " + temp + " and netscore of " + netscore);
      } catch (error) {
        logger.error(error);
      }

      try {
        logger.info("Rate: Getting forks (responsiveness) of the repo...")
        await runPythonScript("get_forks", user, repo);
        // logger.log(`${result}`);
        const path = require("path");
        let jsonstring: string = require(path.join(
          __dirname,
          // "../",
          `/jsons/forks${user}.json`
        ));
        // logger.log(jsonstring);
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
        // netscore += temp * 0.1;
        netscore += Math.min(temp, 1) * 0.1;
        logger.info("Rate: Got forks metric of " + Math.min(temp, 1) + "netscore is now " + netscore);
      } catch (error) {
        logger.error(error);
      }

      try {
        logger.info("Rate: Getting license...")
        await runPythonScript("get_license", user, repo);
        // logger.log(`${result}`);
        const path = require("path");
        let jsonstring: string = require(path.join(
          __dirname,
          // "../",
          `/jsons/license${user}.json`
        ));
        // logger.log(jsonstring);
        license = +jsonstring.split(":")[1];
        output = output + " " + Number(license);
        // netscore += Number(license) * 0.2;

        logger.info("Rate: Got license score " + Number(license) + ", netscore is now " + netscore);
        netscore = Math.min(Number(license), 1) * 0.2;
      } catch (error) {
        logger.error(error);
      }

      try {
        logger.info("Rate: Getting engr...")
        await runPythonScript("get_engr", user, repo);
        // logger.log(`${result}`);
        const path = require("path");
        let jsonstring: string = require(path.join(
          __dirname,
          // "../",
          // "../",
          `/jsons/engr${user}.json`
        ));
        // logger.log(jsonstring);
        engr = +jsonstring.split(":")[1];
        let temp: number = +Number(engr).toFixed(2);
        output = output + " " + temp;
        // netscore += temp * 0.1;
        netscore += Math.min(temp, 1) * 0.05;
        logger.info(`Rate: Got engr score ${temp}, netscore is now ${netscore}`)
      } catch (error) {
        logger.error(error);
      }

      try {
        logger.info("Rate: Removing repo...")
        await runPythonScript("rm_repo", user, repo);
      } catch (error) {
        logger.error(error);
      }
      // console.log(URL + " " + netscore.toString() + output)
      netscore = Math.min(Math.round(netscore * 100) / 100, 1);
      netscores.push(netscore);
      outputStrings.push(URL + " " + netscore.toString() + output);
    } else {
      // logger.log(URL + ": -1, Can only accept github URLs.");
      logger.info("Rate: " + URL + ": -1, Can only accept github URLs or npm URLs.")
      netscores.push(-1);
      outputStrings.push(
        URL + ": -1, Can only accept github URLs or npm URLs."
      );
      netscore = Math.min(Math.round(netscore * 100) / 100, 1);
      netscores.push(netscore);
      outputStrings.push(URL + " " + netscore.toString() + output);
    }
  }
  // logger.log(netscores.sort(function(a, b){return a - b}).reverse())
  let finalOutputStrings = sortOutput(outputStrings, netscores);
  // logger.log(finalOutputStrings);

  emptyDirSync("src/rate/jsons");

  var json: string[] = [];
  for (let i = 0; i < finalOutputStrings.length; i++) {
    let stringgie = finalOutputStrings[i].split(" ");
    // logger.log(
    //   `${stringgie[0]} ${stringgie[1]} ${stringgie[2]} ${stringgie[3]} ${stringgie[4]} ${stringgie[5]} ${stringgie[6]} ${stringgie[7]} ${stringgie[8]}`
    // );
    let temp = JSON.stringify({
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
      //logger.log("complete");
    });
  }

  // logger.log(json)
}

main();
