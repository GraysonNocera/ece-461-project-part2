import { PackageRating } from "../model/packageRating";
import { logger } from "../logging";
import * as cp from "child_process";
import { readFileSync } from "fs";
import * as path from "path";
import {
  PackageRatingUploadValidation,
  PackageRatingChokedValidation,
} from "../model/packageRating";

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
  logger.info("ratePackage: Package rated successfully");

  return packageRate;
}

export function verifyRating(packageRate: PackageRating): boolean {
  // There's gotta be a way to do this is one line with joi

  const { error, value } = PackageRatingUploadValidation.validate(packageRate);
  if (error) {
    logger.debug(
      "verifyRating: Package does not meet qualifications for upload."
    );
    return false;
  }

  logger.info("verifyRating: Package meets qualifications for upload.");
  return true;
}

export function didChokeOnRating(rating: PackageRating): Number {
  // Check if package choked on rating
  // :param rating: PackageRating
  // :return: Number

  const { error, value } = PackageRatingChokedValidation.validate(rating);
  return error ? 1 : 0;
}
