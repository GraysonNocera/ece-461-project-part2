import { Router } from 'express';
import { authorizeUser } from '../middleware/authorize_user';
import { logger } from '../../logging';
import { PackageData } from '../model/packageData';
import { PackageMetadata } from '../model/packageMetadata';
import { Request, Response } from 'express';
import { packages } from '../app';
import Joi, { number } from "joi";
import { PackageHistoryEntry } from "../model/packageHistoryEntry";
import { PackageRating } from "../model/packageRating";
import * as cp from "child_process";
// import { PackageRating } from "./api/model/packageRating";
import { readFile, readFileSync } from "fs";
import { DataType } from "../param";

const express = require("express");

const packageRouter: Router = express.Router();

// This ensures that Content, URL, and JSProgram are all inputted as strings
const schema = Joi.object({
  Content: Joi.string(),
  URL: Joi.string(),
  JSProgram: Joi.string(),
});

// Create a package when POST /package is called
packageRouter.post("/", authorizeUser, (req: Request, res: Response) => {
  logger.info("POST /package");

  let packageData: PackageData = {};
  try {
    packageData = req.body;
    logger.info("Package data: " + JSON.stringify(packageData));
  } catch {
    // Request body is not valid JSON
    logger.info("Invalid JSON for POST /package");
  }

  // Validate with joi (trivial example)
  const { error, value } = schema.validate(packageData);
  if (error) {
    // Request body is not valid
  }

  // Check the inputted data

  // Package already exists: status 409

  // Package not updated due to disqualified rating: status 423

  // Success: status 201

  // Get metadata from package (from APIS?)
  let metadata: PackageMetadata = {
    Name: "test",
    Version: "1.0.0",
    ID: "1234",
  };

  // Store this package in database
  // for now, just store it in memory
  packages.push(packageData);

  logger.info("POST /package: Package created successfully");
  res.status(201).send({
    metadata: metadata,
    data: {
      Content: packageData.Content,
      JSProgram: packageData.JSProgram,
    },
  });
});

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

packageRouter.get("/:id/rate", authorizeUser, (req: Request, res: Response) => {
  logger.info("GET /package/:id/rate");

  let id: number;
  let packageRate: PackageRating;
  let terminal_command: string;
  try {
    id = parseInt(req.params.id);

    // TODO: Get the package from the database using the id
    let url: string = "https://www.npmjs.com/package/express";
    // Fill in PackageRating
    // TODO: Hit rate module to get this info
    terminal_command = `ts-node src/hello-world.ts ${url}`;

    cp.execSync(terminal_command);
    const test_file = readFileSync("./src/score.json", "utf8");
    packageRate = JSON.parse(test_file);
    console.log(packageRate.GoodEngineeringPractice);
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

module.exports = packageRouter;