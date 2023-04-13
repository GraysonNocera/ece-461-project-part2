import { Router } from "express";
import { authorizeUser } from "../middleware/authorize_user";
import { logger } from "../logging";
import { PackageData } from "../model/packageData";
import { PackageMetadata } from "../model/packageMetadata";
import { Request, Response } from "express";
import Joi, { number } from "joi";
import { PackageHistoryEntry } from "../model/packageHistoryEntry";
import { PackageRating } from "../model/packageRating";
import * as cp from "child_process";
// import { PackageRating } from "./api/model/packageRating";
import { readFile, readFileSync } from "fs";
import { Package, PackageModel } from "../model/package";
import path from "path";
import { connectToMongo } from "../config/config";

const express = require("express");

export const packageRouter: Router = express.Router();

// This ensures that Content, URL, and JSProgram are all inputted as strings
const schema = Joi.object({
  Content: Joi.string(),
  URL: Joi.string(),
  JSProgram: Joi.string(),
});

// Create a package when POST /package is called
// Uncomment authorizeUser when we have auth settled, rn it gives infinite loop
packageRouter.post(
  "/",
  /*authorizeUser, */ async (req: Request, res: Response) => {
    const upload_schema = Joi.object({
      Content: Joi.string(),
      URL: Joi.string(),
      JSProgram: Joi.string(),
    }).or("Content", "URL");

    logger.info(`${__filename}: POST /package`);

    let packageData: PackageData = {};
    let rating: PackageRating;
    try {
      packageData = req?.body;
      logger.info("Package data: " + JSON.stringify(packageData));
    } catch {
      // Request body is not valid JSON
      logger.debug("Invalid JSON for POST /package");
      res.status(400);
      return;
    }

    const { error, value } = schema.validate(packageData);
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
    const metadata: PackageMetadata = {
      Name: "test",
      Version: "1.0.0",
      ID: "1234",
    };

    const package_received = new PackageModel({
      metadata: metadata,
      data: packageData,
    });

    await package_received.save();

    logger.info("POST /package: Package created successfully");
    res.status(201).send(package_received);
  }
);

// Create a package when GET /package/byName/{name} is called
packageRouter.get(
  "/byName/:name",
  authorizeUser,
  (req: Request, res: Response) => {
    logger.info("GET /package/byName/{name}");

    let name: string;
    let packageHistoryEntry: PackageHistoryEntry;

    try {
      name = req.params.name;
      logger.info("package name :" + name);

      // TODO: Hit database to get package version information
      packageHistoryEntry = {
        User: {
          name: name,
          isAdmin: true,
        },
        Date: "2021-04-01",
        PackageMetadata: {
          Name: "test package metadata",
          Version: "1.0.0",
          ID: "1234",
        },
        Action: PackageHistoryEntry.ActionEnum.Create,
      };

      res.status(200).send([packageHistoryEntry, packageHistoryEntry]);
    } catch {
      // Request body is not valid JSON
      logger.info("Invalid JSON for GET /package/byName/{name}");
    }

    // Validate with joi (trivial example)
  }
);

// Return a package when DELETE /package/byName/{name} is called
packageRouter.delete(
  "/byName/:name",
  authorizeUser,
  (req: Request, res: Response) => {
    logger.info("DELETE /package/byName/{name}");

    let name: string;
    let auth: string;
    try {
      name = req.params.name;
      auth = req.header("X-Authorization") || "";
      // Require auth

      logger.info("Auth data: " + auth);

      // TODO: Get the package from the database using the name
      // TODO: Delete package

      // If status is 200, ok. Send 404 if package doesn't exist.
      res.status(200).send("Package is deleted.");

      res.status(404).send("Package does not exist.");
    } catch {
      // Request body is not valid JSON
      logger.info("Invalid JSON for DELETE /package/:id");
    }
  }
);

// Rate a package when GET /package/:id/rate is called
packageRouter.get("/:id/rate", authorizeUser, (req: Request, res: Response) => {
  logger.info("GET /package/:id/rate");

  let id: number;
  let packageRate: PackageRating;
  let terminal_command: string;
  try {
    id = parseInt(req.params.id);

    // TODO: Get the package from the database using the id
    const url = "https://www.npmjs.com/package/express";
    // Fill in PackageRating
    // TODO: Hit rate module to get this info
    // const test_file = readFileSync(path.join(__dirname, "../", "rate/score.json"), "utf8");
    logger.info("Read file");
    terminal_command = `ts-node src/rate/hello-world.ts ${url}`;

    cp.execSync(terminal_command);
    const test_file = readFileSync(
      path.join(__dirname, "../", "rate/score.json"),
      "utf8"
    );
    packageRate = JSON.parse(test_file);
    if (
      packageRate.NetScore == Number(-1) ||
      packageRate.BusFactor == Number(-1) ||
      packageRate.Correctness == Number(-1) ||
      packageRate.GoodEngineeringPractice == Number(-1) ||
      packageRate.GoodPinningPractice == Number(-1) ||
      packageRate.LicenseScore == Number(-1) ||
      packageRate.RampUp == Number(-1) ||
      packageRate.ResponsiveMaintainer == Number(-1)
    ) {
      res.status(500).send();
    }
    // TODO: Update the database to have this rating for the given package

    // If status is 200, ok. Send 404 if package doesn't exist.
    // Send 500 if rating module failed
    res.status(200).send(packageRate);
  } catch {
    // Request body is not valid JSON
    logger.info("Invalid JSON for GET /package/:id/rate");
  }

  // Validate with joi (trivial example)
});

// Fetch a package when GET /package/:id is called
packageRouter.get(
  "/:id",
  authorizeUser,
  async (req: Request, res: Response) => {
    logger.info("GET /package/:id");

    const id: number = parseInt(req?.params?.id);

    // No ID provided or bad auth, return 400
    if (!id) {
      res
        .status(400)
        .send(
          "There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid."
        );
      return;
    }

    const query = PackageModel.where({ _id: id });
    const package_received = await query.findOne();

    if (!package_received) {
      res.status(404).send("Package does not exist.");
      return;
    }

    logger.info("Found package: " + package_received?.toJSON());

    // Package doesn't exist, return 404
    if (!package_received?.data.Content) {
      res.status(400).send("No Content supplied");
      return;
    }

    // Return package
    res.status(200).send(package_received.toJSON());

    return;

    // default error?
    res.status(500).send({ code: 0, message: "Random error" });
  }
);

// Update a package when PUT /package/:id is called
packageRouter.put("/:id", authorizeUser, (req: Request, res: Response) => {
  logger.info("PUT /package/:id");

  let id: number;
  let auth: string;
  let packageInfo: Package;
  try {
    id = parseInt(req.params.id);
    auth = req.header("X-Authorization") || "";
    // Require auth

    logger.info("Auth data: " + auth);

    packageInfo = req.body; // Get user-inputted package details
    // Validate with joi

    // TODO: Get the package from the database using the id
    // TODO: Update contents with new contents

    packageInfo.data.Content = "new content yaya";

    // If status is 200, ok. Send 404 if package doesn't exist.
    res.status(200).send(packageInfo);

    res.status(404).send("Package does not exist.");
  } catch {
    // Request body is not valid JSON
    logger.info("Invalid JSON for PUT /package/:id");
  }
});

// Delete a package when DELETE /package/:id is called
packageRouter.delete(
  "/:id",
  authorizeUser,
  async (req: Request, res: Response) => {
    logger.info("DELETE /package/:id");

    const id: number = parseInt(req?.params?.id);

    // No ID provided or bad auth, return 400
    if (!id) {
      res
        .status(400)
        .send(
          "There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid."
        );
      return;
    }

    const query = PackageModel.where({ _id: id });
    const package_received = await query.findOne();

    // Package doesn't exist, return 404
    if (!package_received) {
      res.status(404).send("Package does not exist");
      return;
    }

    // Delete package
    const result = await query.deleteOne();
    if (result) {
      res.status(404).send("Package does not exist");
      return;
    }

    res.status(200).send("Package is deleted.");
  }
);

// Search packages via a Regex when POST /package/byRegEx is called
packageRouter.post("/byRegEx", authorizeUser, (req: Request, res: Response) => {
  logger.info("POST /package/byRegEx/{regex}");

  // let regex: string;
  let regex_body: string;
  let auth: string;
  let packageMetadata: PackageMetadata;
  let return_data: object;
  try {
    // regex = req.params.regex;
    // logger.info("Got regex: " + regex);

    auth = req.header("X-Authorization") || "";
    // Require auth

    logger.info("Auth data: " + auth);

    regex_body = req.body.PackageRegEx;

    logger.info("Got regex body: " + regex_body);

    // TODO: Get the package from the database using the regex
    // TODO: Return package

    // TODO: Hit database for this metadata
    packageMetadata = {
      Name: "test",
      Version: "1.0.0",
      ID: "1234",
    };

    logger.info("Preparing return_data");

    // According to YML spec, return only name and version
    return_data = {
      Name: packageMetadata.Name,
      Version: packageMetadata.Version,
    };

    logger.info("Sending status");

    // If status is 200, ok. Send 404 if package doesn't exist.
    res.status(200).send([return_data, return_data]);

    //res.status(404).send("No package found under this regex.");
  } catch {
    // Request body is not valid JSON
    logger.info("Invalid JSON for POST /RegEx/{regex}");
  }
});

function ratePackage(url: string): PackageRating {
  const terminal_command = `ts-node src/rate/hello-world.ts ${url}`;

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

// module.exports = packageRouter;
