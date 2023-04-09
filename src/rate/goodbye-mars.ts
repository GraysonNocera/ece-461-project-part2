import * as cp from "child_process";
import { PackageRating } from "../model/packageRating";
import { readFile, readFileSync } from "fs";

function demo(url: string) {
  let terminal_command: string = `node dist/hello-world.js ${url}`;
  cp.execSync(terminal_command);
  const test_file = readFileSync(__dirname + "/score.json", "utf8");
  let test: PackageRating = JSON.parse(test_file);
  console.log(test);
  console.log(test.BusFactor);
  console.log(test.Correctness);
  console.log(test.RampUp);
}

demo("https://github.com/nullivex/nodist");
