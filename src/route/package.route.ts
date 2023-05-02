import { Router } from "express";
import { authorizeUser } from "../middleware/authorizeUser";
import { logger } from "../logging";
import { PackageDataUploadValidation } from "../model/packageData";
import { PackageMetadata } from "../model/packageMetadata";
import { Request, Response } from "express";
import { ratePackage, verify } from "../service/rate";
import { PackageRatingChokedValidation } from "../model/packageRating";
import { PackageRating, PackageRatingModel } from "../model/packageRating";
import { Package, PackageModel } from "../model/package";
import { postPackage } from "../controller/package.controller";
import { Validate } from "../middleware/validate";
import { deleteFileFromMongo, uploadFileToMongo } from "../config/config";
import mongoose from "mongoose";
import { downloadFileFromMongo } from "../config/config";
import fs from "fs";
import express from "express";
import path from "path";
let safe = require("safe-regex");

export const packageRouter: Router = express.Router();

// Create a package when POST /package is called
// Uncomment authorizeUser when we have auth settled, rn it gives infinite loop
packageRouter.post(
  "/",
  authorizeUser,
  Validate(PackageDataUploadValidation),
  postPackage
);

packageRouter.get(
  "/byName/:name",
  authorizeUser,
  async (req: Request, res: Response) => {
    logger.info(
      "GET /package/byName/{name}: This will not be implemented because we are not doing this additional requirement."
    );
    return res.status(400).send("Not implementing this requirement.");
  }
);

packageRouter.delete(
  "/byName/:name",
  authorizeUser,
  (req: Request, res: Response) => {
    logger.info(
      "DELETE /package/byName/{name}: This will not be implemented because we are not doing this additional requirement."
    );
    return res.status(400).send("Not implementing this requirement.");
  }
);

// Rate a package when GET /package/:id/rate is called
packageRouter.get(
  "/:id/rate",
  authorizeUser,
  async (req: Request, res: Response) => {
    logger.info("GET /package/:id/rate");

    let id: string;
    let rating: PackageRating;
    let ratingToSave: any;
    let existingRating: any;
    let packageToRate: any;
    try {
      id = req?.params?.id;

      if (!mongoose.isObjectIdOrHexString(id)) {
        logger.debug("GET /package/:id/rate: Invalid package ID + " + id);
        return res.status(404).send("No package found");
      }

      packageToRate = await PackageModel.findOne({ _id: id }).exec();
      if (!packageToRate) {
        logger.debug("GET /package/:id/rate: Package does not exist");
        return res.status(404).send("Package does not exist.");
      }

      existingRating = await PackageRatingModel.findOne({ _id: id }).exec();
      if (existingRating) {
        logger.info(
          "GET /package/:id/rate: Package already rated, returning existing rating"
        );
        return res.status(200).send(existingRating.toObject());
      }

      rating = ratePackage(packageToRate.data.URL);

      if (!verify(PackageRatingChokedValidation, rating)) {
        logger.info("POST /package: Package not uploaded, disqualified rating");
        return res
          .status(500)
          .send(
            "	The package rating system choked on at least one of the metrics."
          );
      }

      // Save rating so we have a rating for this package
      ratingToSave = new PackageRatingModel(rating);
      ratingToSave._id = packageToRate._id;

      logger.info("GET /package/:id/rate: Saving rating: " + ratingToSave);
      await ratingToSave.save();

      return res.status(200).send(rating);
    } catch {
      // Request body is not valid JSON
      logger.info("Invalid JSON for GET /package/:id/rate");
      return res.status(400).send("Invalid JSON");
    }
  }
);

// Fetch a package when GET /package/:id is called
packageRouter.get(
  "/:id",
  authorizeUser,
  async (req: Request, res: Response) => {
    logger.info("GET /package/:id");

    let id: string = req?.params?.id;
    let package_received: any;
    if (res.locals.download) {
      // Ensure valid ID
      if (!mongoose.isObjectIdOrHexString(id)) {
        logger.debug("GET /package/:id: Invalid package ID + " + id);
        return res.status(404).send("No package found");
      }

      // Search the database for this package
      const query = PackageModel.where({
        _id: new mongoose.Types.ObjectId(id),
      });
      package_received = await query.findOne();
      if (!package_received) {
        logger.debug("GET /package/:id: Package does not exist");
        return res.status(404).send("Package does not exist.");
      }

      logger.info("Found package: " + package_received?.toObject());

      // Load the content from mongo
      downloadFileFromMongo(package_received._id, (content, error) => {
        if (error) {
          logger.debug("Error downloading file from mongo: " + error);
          return res.status(404).send("Invalid content");
        }

        logger.info("Downloaded content");

        package_received.data.Content = content;

        logger.info("Returning package: " + package_received?.toObject());
        return res
          .status(200)
          .send(package_received.toObject({ remove: "URL" }));
      });
    } else {
      return res
        .status(401)
        .send("You don't have the right permissions to do this request");
    }
  }
);

// Update a package when PUT /package/:id is called
packageRouter.put(
  "/:id",
  authorizeUser,
  async (req: Request, res: Response) => {
    logger.info("PUT /package/:id");

    let id: string;
    let auth: string;
    let packageInfo: Package;
    if (res.locals.upload) {
      try {
        id = req?.params?.id;

        if (!mongoose.isObjectIdOrHexString(id)) {
          logger.debug("PUT /package/:id: Invalid package ID + " + id);
          return res.status(404).send("No package found");
        }

        packageInfo = req.body; // Get user-inputted package details

        logger.info("PUT /package/:id: received package " + packageInfo);

        const query = PackageModel.where({ _id: id });

        try {
          const package_received = await query.findOne();
          // Package doesn't exist, return 404
          if (!package_received) {
            logger.debug("PUT /package/:id: Packaged don't exist");
            res.status(404).send("Package does not exist");
            return;
          }

          if (
            package_received.metadata.Name != packageInfo.metadata.Name ||
            package_received.metadata.Version != packageInfo.metadata.Version ||
            package_received.metadata.ID != packageInfo.metadata.ID
          ) {
            logger.debug("PUT /package/:id: Package metadata does not match");

            return res
              .status(400)
              .send(
                "There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid."
              );
          }

          if (!onlyOneFieldSet(packageInfo.data)) {
            logger.debug("PUT /package/:id: More than one field set");
            return res.status(400).send("More than one field set");
          }

          // Update contents with new contents
          // As of right now, I'm not sure if we should handle the user setting multiple
          // fields as an error or if we should just update one of them. Waiting on piazza response
          if (packageInfo.data.Content) {
            let fileName: string = `${package_received.metadata.Name}.txt`;
            let filePath: string = path.join(
              __dirname,
              "..",
              "artifacts",
              fileName
            );
            package_received.data.Content = fileName;

            // Write content to a text file
            fs.writeFileSync(filePath, packageInfo.data.Content);

            uploadFileToMongo(
              filePath,
              new mongoose.Types.ObjectId(package_received.metadata.ID)
            );
          } else if (packageInfo.data.URL) {
            package_received.data.URL = packageInfo.data.URL;
          } else if (packageInfo.data.JSProgram) {
            package_received.data.JSProgram = packageInfo.data.JSProgram;
          }

          logger.info("PUT /package/:id: Saving package");

          package_received.save();

          logger.info(
            "PUT /package/:id: Saved package: " + package_received.toObject()
          );

          // If status is 200, ok. Send 404 if package doesn't exist.
          return res.status(200).send("Version is updated.");
        } catch (error) {
          logger.debug("PUT /package/:id: " + error);
          return res.status(404).send("Invalid JSON");
        }
      } catch {
        // Request body is not valid JSON
        logger.debug("Invalid JSON for PUT /package/:id");
        return res.status(400).send("Invalid JSON");
      }
    } else {
      return res
        .status(401)
        .send("You don't have the right permissions to do this request");
    }
  }
);

// Delete a package when DELETE /package/:id is called
packageRouter.delete(
  "/:id",
  authorizeUser,
  async (req: Request, res: Response) => {
    logger.info("DELETE /package/:id");

    let package_received;
    let id: string = req?.params?.id;

    logger.info("DELETE /package/:id: Deleting package " + id);
    if (!mongoose.isObjectIdOrHexString(id)) {
      // Ensure valid ID
      logger.debug("DELETE /package/:id: Invalid package ID + " + id);
      return res.status(404).send("No package found");
    }

    const query = PackageModel.where({
      _id: new mongoose.Types.ObjectId(id),
    });
    package_received = await query.deleteOne();

    // Package doesn't exist, return 404
    if (!package_received.deletedCount) {
      logger.debug("DELETE /package/:id: Package does not exist");
      return res.status(404).send("Package does not exist.");
    }

    // Remove the Content
    deleteFileFromMongo(new mongoose.Types.ObjectId(id));

    logger.info("DELETE /package/:id: Package is deleted");
    return res.status(200).send("Package is deleted.");
  }
);

// Search packages via a Regex when POST /package/byRegEx is called
packageRouter.post(
  "/byRegEx",
  authorizeUser,
  async (req: Request, res: Response) => {
    logger.info("POST /package/byRegEx/{regex}");

    // let regex: string;
    let regex_body: string;
    let auth: string;
    let packageMetadata: PackageMetadata;
    let return_data: Object;
    if (res.locals.search) {
      try {
        // regex will be in the body of the request; Example request:
        // {
        //   "Regex": "string"
        // }
        // logger.info("Got regex: " + regex);

        regex_body = req.body.PackageRegEx;
        let isSafe = safe(new RegExp(regex_body));
        if (!isSafe) {
          logger.debug("POST /package/byRegEx: Regex is not safe");
          return res.status(400).send("Regex is not safe");
        }

        logger.info("Got regex body: " + regex_body);

        // Get the package from the database using the regex
        const regex = new RegExp(regex_body, "i");
        const packages = await PackageModel.find({
          "metadata.Name": regex,
        }).exec();

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

        logger.info("Got packages: " + packages);
        logger.info("Preparing return_data");

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
          logger.info("Sending return_data: " + return_data);
          return res.status(200).send(return_data);
        } else {
          logger.info("Sending 404, no packaged found");
          return res.status(404).send("No package found under this regex.");
        }
      } catch {
        // Request body is not valid JSON
        logger.info("Invalid JSON for POST /RegEx/{regex}");
        return res.status(400).send("Invalid JSON");
      }
    } else {
      return res
        .status(401)
        .send("You don't have the right permissions to do this request");
    }
  }
);

function onlyOneFieldSet(obj: any): boolean {
  let count = 0;
  for (let key in obj) {
    if (obj[key]) {
      count++;
    }
  }
  return count == 1;
}

// module.exports = packageRouter;
