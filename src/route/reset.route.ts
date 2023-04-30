import { Router } from "express";
import { authorizeUser } from "../middleware/authorizeUser";
import { logger } from "../logging";
import { Request, Response } from "express";
import { PackageModel } from "../model/package";
import { ProfileModel } from "../model/user";
import { PackageRatingModel } from "../model/packageRating";
import { deleteAllFilesFromMongo } from "../config/config";
const express = require("express");

export const resetRouter: Router = express.Router();

// Create a package when DELETE /reset is schema
resetRouter.delete("/", authorizeUser, async (req: Request, res: Response) => {
  logger.info("DELETE /reset");

  try {
    logger.info("Request body: " + req.headers);

    const defaultuser = new ProfileModel({
      User: {
        name: "ece30861defaultadminuser",
        isAdmin: true,
        isUpload: true,
        isDownload: true,
        isSearch: true,
      },
      Secret: {
        password:
          "ee8eb0437b289df8e5786687473ae2b81dc4533b00b837b7b31ac4c292f89c5f",
      },
    });

    //await defaultuser.save();
    if (res.locals.isAdmin) {
      logger.info("Resetting registry");
      await PackageModel.deleteMany({});
      await ProfileModel.deleteMany({});
      await PackageRatingModel.deleteMany({});
      deleteAllFilesFromMongo();
      await defaultuser.save();

      logger.info("Registry is reset");
      return res.status(200).send("Registry is reset");
    }

    logger.info("User is not admin");
    return res
      .status(401)
      .send("You do not have permission to reset the registry.");
  } catch (error) {
    // Request body is not valid JSON
    logger.info("Invalid JSON for DELETE /reset");
    return res.status(400).send("Invalid JSON");
  }
});

// module.exports = resetRouter;
