import path from "path";
import * as cp from "child_process";
import { readFileSync } from "fs";
import { PackageRating } from "../src/model/packageRating";

describe("Test the rate module", () => {
  test("Test the rate module", () => {
    let url = "https://github.com/facebook/react";
    cp.execSync(
      `npx ts-node ${path.join(
        __dirname,
        "..",
        "src",
        "rate",
        "hello-world.ts"
      )} ${url}`
    );

    let filePath: string = path.join(
      __dirname,
      "..",
      "src",
      "rate",
      "score.json"
    );
    const packageRate: PackageRating = JSON.parse(
      readFileSync(filePath, "utf8")
    );
    const averageScore = weightedAverage(packageRate);
    expect(averageScore).toBeCloseTo(packageRate.NetScore);
  });
});

function weightedAverage(packageRate: PackageRating): Number {
  const average =
    packageRate.LicenseScore * 0.2 +
    packageRate.BusFactor * 0.2 * packageRate.GoodPinningPractice * 0.1 +
    packageRate.GoodEngineeringPractice * 0.1 + 
    packageRate. * 0.1 +;

  return 0;
}
