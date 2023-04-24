import { Router } from "express";
import { authorizeUser } from "../middleware/authorizeUser";
import { logger } from "../logging";
import { PackageData, PackageDataUploadValidation } from "../model/packageData";
import { PackageMetadata } from "../model/packageMetadata";
import { Request, Response } from "express";
// import Joi, { number } from "joi";
import { PackageHistoryEntry } from "../model/packageHistoryEntry";
import { PackageHistoryEntryModel } from "../model/packageHistoryEntry";

import { PackageRating } from "../model/packageRating";
import * as cp from "child_process";
// import { PackageRating } from "./api/model/packageRating";
import { readFileSync } from "fs";
import { Package, PackageModel } from "../model/package";
import * as path from "path";
import { postPackage } from "../controller/package.controller";
import { Validate } from "../middleware/validate";
import mongoose from "mongoose";

const express = require("express");

export const packageRouter: Router = express.Router();

// Create a package when POST /package is called
// Uncomment authorizeUser when we have auth settled, rn it gives infinite loop
packageRouter.post("/", /*authorizeUser, */ Validate(PackageDataUploadValidation), postPackage);

// Create a package when GET /package/byName/{name} is called
packageRouter.get(
  "/byName/:name",
  authorizeUser,
  async (req: Request, res: Response) => {
    logger.info("GET /package/byName/{name}");

    const packageName = req.params.name;
    // let packageHistoryEntry: PackageHistoryEntry;

    try {
      logger.info("package name :" + packageName);

      // TODO: Hit database to get package version information
      // packageHistoryEntry = {
      //   User: {
      //     name: name,
      //     isAdmin: true,
      //   },
      //   Date: "2021-04-01",
      //   PackageMetadata: {
      //     Name: "test package metadata",
      //     Version: "1.0.0",
      //     ID: "1234",
      //   },
      //   Action: "CREATE",
      // };

      const packageHistory = await PackageHistoryEntryModel.find({
        "PackageMetadata.Name": packageName,
      }).exec();

      if (!packageHistory || packageHistory.length === 0) {
        return res.status(404).json({ message: "No such package." });
      }

      res.status(200).send([packageHistory]);
    } catch {
      // Request body is not valid JSON
      logger.info("Invalid JSON for GET /package/byName/{name}");
      res.status(500).json({ message: "Unexpected error." });
    }
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
    let url: string = "https://www.npmjs.com/package/express";
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

    let id: number = parseInt(req?.params?.id);

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
packageRouter.put(
  "/:id",
  /*authorizeUser, */
  async (req: Request, res: Response) => {
    logger.info("PUT /package/:id");

    let id: string;
    let auth: string;
    let packageInfo: Package;
    try {
      id = (req.params.id);
      logger.info("Penis")
      auth = req.header("X-Authorization") || "";
      // Require auth

      logger.info("Auth data: " + auth);

      packageInfo = req.body; // Get user-inputted package details
      // Validate with joi

      const query = PackageModel.where({ _id: id });
      
      try {

        const package_received = await query.findOne();
        // Package doesn't exist, return 404
        if (!package_received) {
          res.status(404).send("Package does not exist");
          return;
        }

        if (package_received.metadata.Name != packageInfo.metadata.Name
          || package_received.metadata.Version != packageInfo.metadata.Version
          || package_received.metadata.ID != packageInfo.metadata.ID ) {

          res.status(400).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.")
          return;
        }

        // Update contents with new contents
        if (packageInfo.data.Content) {
          package_received.data.Content = packageInfo.data.Content;
        }
        if (packageInfo.data.URL) {
          package_received.data.URL = packageInfo.data.URL;
        }
        if (packageInfo.data.JSProgram) {
          package_received.data.JSProgram = packageInfo.data.JSProgram;
        }

        await package_received.save();

        // If status is 200, ok. Send 404 if package doesn't exist.
        res.status(200).send(package_received.toJSON());
      } catch (error) {
        logger.info(error);
      }


      
    } catch {
      // Request body is not valid JSON
      logger.info("Invalid JSON for PUT /package/:id");
      res.status(400).send("Invalid JSON");
    }
  }
);

// Delete a package when DELETE /package/:id is called
packageRouter.delete(
  "/:id",
  /*authorizeUser, */
  async (req: Request, res: Response) => {
    logger.info("DELETE /package/:id");

    let package_received;
    let id: string = req?.params?.id;

    try {
      const query = PackageModel.where({ _id: new mongoose.Types.ObjectId(id) });
      package_received = await query.deleteOne();
    } catch {
      return res.status(400).send("Invalid ID");
    }

    // Package doesn't exist, return 404
    if (!package_received.deletedCount) {
      return res.status(404).send("Package does not exist.");
    } else {
      return res.status(200).send("Package is deleted.");
    }
  }
);

// Search packages via a Regex when POST /package/byRegEx is called
packageRouter.post("/byRegEx", async (req: Request, res: Response) => { //authorizeUser,
  logger.info("POST /package/byRegEx/{regex}");

  // let regex: string;
  let regex_body: string;
  let auth: string;
  let packageMetadata: PackageMetadata;
  let return_data: Object;
  try {
    // regex will be in the body of the request; Example request:
    // {
    //   "Regex": "string"
    // }
    // logger.info("Got regex: " + regex);

    auth = req.header("X-Authorization") || "";
    // Require auth

    logger.info("Auth data: " + auth);

    regex_body = req.body.PackageRegEx;

    logger.info("Got regex body: " + regex_body);

    // TODO: Get the package from the database using the regex
    // TODO: Return a list of packages
    const regex = new RegExp(regex_body, "i");
    const packages = await PackageModel.find({ "metadata.Name": regex }).exec();

    // EXAMPLE RESPONSE:
    // [
    //   {
    //     "Version": "1.2.3",
    //     "Name": "Underscore"
    //   },
    //   {
    //     "Version": "1.2.3-2.1.0",
    //     "Name": "Lodash"
    //   },
    //   {
    //     "Version": "^1.2.3",
    //     "Name": "Re
    //   }
    // ]

    // TODO: Hit database for this metadata
    // packageMetadata = {
    //   Name: "test",
    //   Version: "1.0.0",
    //   ID: "1234",
    // };

    logger.info("Preparing return_data");
    // logger.info()

    // According to YML spec, return only name and version
    return_data = packages.map((pkg) => {
      return {
        Name: pkg.metadata.Name,
        Version: pkg.metadata.Version,
      };
    });

    logger.info("Sending status");

    // If status is 200, ok. Send 404 if package doesn't exist.
    if (packages.length > 0) {
      res.status(200).send(return_data);
    } else {
      res.status(404).send("No package found under this regex.");
    }
    //res.status(404).send("No package found under this regex.");
  } catch {
    // Request body is not valid JSON
    logger.info("Invalid JSON for POST /RegEx/{regex}");
    // is this the right error to throw?
    res.status(400).send("Invalid JSON");
  }
});

// module.exports = packageRouter;
