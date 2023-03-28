import * as cp from "child_process";
import { PackageRating } from "./api/model/packageRating";
import { readFile, readFileSync } from "fs";

async function demo(url: string) {
  let terminal_command: string = `node dist/hello-world.js ${url}`;
  let terminal_output: Buffer;
  terminal_output = cp.execSync(terminal_command);
  const test_file = readFileSync("./src/score.json", "utf8");
  let test: PackageRating = JSON.parse(test_file);
  console.log(test);
  console.log(test.BusFactor);
  console.log(test.Correctness);
  console.log(test.RampUp);
}

demo("Test_2.txt");
