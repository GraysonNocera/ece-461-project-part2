import { PackageRating } from "../model/packageRating";
import { logger } from "../logging";
import * as cp from "child_process";
import { readFileSync } from "fs";
import * as path from "path";
import Joi from "joi";

export function ratePackage(url: string): PackageRating {
  logger.info("ratePackage: Running rate script on url " + url + "...");

  let terminal_command = `ts-node src/rate/hello-world.ts ${url}`;

  cp.execSync(terminal_command);
  const test_file = readFileSync(
    path.join(__dirname, "../", "rate/score.json"),
    "utf8"
  );
  const packageRate: PackageRating = JSON.parse(test_file);

  logger.info("ratePackage: Package received rating " + packageRate.NetScore);

  return packageRate;
}

export function verify(schema: Joi.Schema, object: object) {
  // Verify that object meets schema requirements

  logger.info("verify: Verifying object against schema...");

  const { error, value } = schema.validate(object);
  if (error) {
    logger.debug("verify: Object does not meet schema requirements.");
    return false;
  }

  return true;
}
