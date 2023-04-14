import { Router } from "express";
import { authorizeUser } from "../middleware/authorize_user";
import { logger } from "../logging";
import { PackageData } from "../model/packageData";
import { PackageMetadata } from "../model/packageMetadata";
import { Request, Response } from "express";
import Joi, { number } from "joi";
import { PackageHistoryEntry } from "../model/packageHistoryEntry";
import { PackageHistoryEntryModel } from "../model/packageHistoryEntry";

import { PackageRating } from "../model/packageRating";
import * as cp from "child_process";
// import { PackageRating } from "./api/model/packageRating";
import { readFileSync } from "fs";
import { Package, PackageModel } from "../model/package";
import path from "path";
import { PackageDataUploadValidation } from "../model/packageData";

export async function postPackage(req: Request, res: Response) {

  logger.info(`packageRouter: POST /package`);

  let packageData: PackageData = {};
  let rating: PackageRating;
  try {
    packageData = req?.body;
    logger.info("POST /package: Package data: " + JSON.stringify(packageData));
  } catch {
    // Request body is not valid JSON
    logger.debug("POST /package: Invalid JSON for POST /package");
    res.status(400);
    return;
  }

  // let test = new Date();
  // test.toISOString();

  const { error } = PackageDataUploadValidation.validate(packageData);
  if (error) {
    // Request body is not valid
    logger.debug("Request body is not valid");
    res.status(400);
    return;
  }

  // Check the inputted data

  // Package already exists: status 409
  const query = PackageModel.find();
  query.or([
    { "data.Content": packageData.Content },
    { "data.URL": packageData.URL },
  ]);
  const package_query_results = await query.findOne(); // this should be an async function
  if (package_query_results) {
    logger.info("POST /package: Package already exists");
    res.status(409).send(package_query_results);
    return;
  }

  // Package not updated due to disqualified rating: status 423
  if (packageData.URL) {
    rating = ratePackage(packageData.URL);
    if (!verifyRating(rating)) {
      logger.info(
        "POST /package: Package not updated due to disqualified rating"
      );
      res.status(423).send("Package not updated due to disqualified rating");
      return;
    }
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

  let package_received = new PackageModel({
    metadata: metadata,
    data: packageData,
  });

  await package_received.save();

  logger.info("POST /package: Package created successfully");
  res.status(201).send(package_received);
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
  const upload_qualifications = Joi.object({
    NetScore: Joi.number().min(0.5).required(),
    BusFactor: Joi.number().min(0.5).required(),
    Correctness: Joi.number().min(0.5).required(),
    RampUp: Joi.number().min(0.5).required(),
    ResponsiveMaintainer: Joi.number().min(0.5).required(),
    LicenseScore: Joi.number().min(0.5).required(),
    GoodPinningPractice: Joi.number().min(0.5).required(),
    GoodEngineeringPractice: Joi.number().min(0.5).required(),
  });

  const { error, value } = upload_qualifications.validate(packageRate);
  if (error) {
    logger.debug("Package does not meet qualifications for upload.");
    return false;
  }

  return true;
}
