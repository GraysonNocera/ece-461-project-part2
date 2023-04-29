import path from "path";
import * as cp from "child_process";
import { readFileSync } from "fs";
import { PackageRating } from "../src/model/packageRating";

describe("Test the rate module", () => {
  test("Test the rate module", () => {
    let url = "https://github.com/facebook/react";
    cp.execSync(
      `npx ts-node ${path.join(__dirname, "..", "src", "rate", "hello-world.ts")} ${url}`
    );

    let filePath: string = path.join(__dirname, "..", "src", "rate", "score.json")
    const packageRate: PackageRating = JSON.parse(readFileSync(filePath, 'utf8'));
    const values = Object.entries(packageRate)
      .filter(([key]) => key !== 'NetScore')
      .map(([, value]) => value);
    const averageScore = average(values);
    expect(averageScore).toBeCloseTo(packageRate.NetScore)
  });
});

function average(arr: number[]) {
  let sum = 0;
  arr.forEach((element) => {
    sum += element;
  });
  return sum / arr.length;
}

function weightedAverage(packageRate: PackageRating): Number {

  const average = packageRate.LicenseScore * 0.2 + packageRate.BusFactor * 

  return 0;
}