import { Router } from "express";
import { authorizeUser } from "../middleware/authorize_user";
import { logger } from "../logging";
import { PackageData } from "../model/packageData";
import { PackageMetadata } from "../model/packageMetadata";
import { Request, Response } from "express";
import Joi, { number } from "joi";
import { PackageHistoryEntry } from "../model/packageHistoryEntry";
import { PackageHistoryEntryModel } from "../model/packageHistoryEntry";

import { PackageRating, PackageRatingUploadValidation } from "../model/packageRating";
import * as cp from "child_process";
// import { PackageRating } from "./api/model/packageRating";
import { readFileSync } from "fs";
import { Package, PackageModel } from "../model/package";
import path from "path";
import { PackageDataUploadValidation } from "../model/packageData";
import JSZip, { JSZipObject } from "jszip";

export async function postPackage(req: Request, res: Response) {
  logger.info(`packageRouter: POST /package`);

  let packageToUpload;
  let rating: PackageRating;
  let url: string;

  // let test = new Date();
  // test.toISOString();

  const { error } = PackageDataUploadValidation.validate(req?.body);
  if (error) {
    // Request body is not valid
    logger.debug("Request body is not valid");
    res.status(400);
    return;
  }

  packageToUpload = new PackageModel({
    data: req?.body,
  });

  // Package already exists: status 409
  const query = PackageModel.find();
  query.or([
    { "data.Content": packageToUpload.data.Content },
    { "data.URL": packageToUpload.data.URL },
  ]);
  const package_query_results = await query.findOne(); // this should be an async function
  if (package_query_results) {
    logger.info("POST /package: Package already exists");
    res.status(409).send(package_query_results);
    return;
  }

  if (packageToUpload.Content) {
    url = await getPackageURL(packageToUpload.Content);
  } else {
    url = packageToUpload.URL;
  }

  // Package not updated due to disqualified rating: status 423
  rating = ratePackage(packageToUpload.URL);
  if (!verifyRating(rating)) {
    logger.info(
      "POST /package: Package not updated due to disqualified rating"
    );
    res.status(423).send("Package not updated due to disqualified rating");
    return;
  }

  // Success: status 201

  // Get metadata from package (from APIS?)
  // We probably can get the name a version from something like a GraphQL call
  // We can get the ID from the database (by mirroring the given _id field that mongoDB provides),
  // just gotta figure out how to do that
  let metadata: PackageMetadata = {
    Name: "test",
    Version: "1.0.0",
    ID: "1234",
  };

  packageToUpload.metadata = metadata;

  // Create history entry

  await packageToUpload.save();

  logger.info("POST /package: Package created successfully");
  res.status(201).send(packageToUpload);
}

function ratePackage(url: string): PackageRating {
  let terminal_command = `ts-node src/rate/hello-world.ts ${url}`;

  cp.execSync(terminal_command);
  const test_file = readFileSync(
    path.join(__dirname, "../", "rate/score.json"),
    "utf8"
  );
  const packageRate: PackageRating = JSON.parse(test_file);

  return packageRate;
}

function verifyRating(packageRate: PackageRating) {
  // There's gotta be a way to do this is one line with joi

  const { error, value } = PackageRatingUploadValidation.validate(packageRate);
  if (error) {
    logger.debug("verifyRating: Package does not meet qualifications for upload.");
    return false;
  }

  logger.info("verifyRating: Package meets qualifications for upload.");
  return true;
}

async function getPackageURL(content: string): Promise<string> {

  logger.info("getPackageURL: Getting url from content base64 string");

  let zip: JSZip = new JSZip();
  zip = await zip.loadAsync(content, { base64: true, createFolders: true });

  // console.log(await zip.file("exceptions/CommcourierException.java")?.async("string"));
  let package_json_path: string = zip.file(/package.json/)[0]?.name;
  // console.log(package_json_path);

  let package_json_contents: string | undefined = await zip
    .file(package_json_path)
    ?.async("string");
  // console.log(package_json_contents);

  let package_json_object: Object;
  if (package_json_contents) {
    package_json_object = JSON.parse(package_json_contents);
    if (package_json_object["homepage"]) {
      logger.info("getPackageURL: Found homepage in package.json: " + package_json_object["homepage"]);
      return package_json_object["homepage"];
    }
    logger.debug("getPackageURL: No homepage found in package.json");
  }

  logger.debug("getPackageURL: No url found in package.json");
  return "";
}

// async function main() {
//     console.log(await getPackageURL(""));
// }
// main();
