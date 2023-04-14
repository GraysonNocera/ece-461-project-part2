import { Router } from 'express';
import { authorizeUser } from '../middleware/authorize_user';
import { logger } from '../logging';
import { Request, Response } from 'express';
import { Package } from "../model/package";
import mongoose from "mongoose";
import { PackageMetadata } from "../model/packageMetadata";
import { PackageData } from "../model/packageData";
const express = require("express");

export const resetRouter: Router = express.Router();

// This ensures that Content, URL, and JSProgram are all inputted as strings
// const schema = Joi.object({
//     Content: Joi.string(),
//     URL: Joi.string(),
//     JSProgram: Joi.string(),
// });
const meta = new mongoose.Schema<PackageMetadata>({
  Name: { type: String, required: true },
  Version: { type: String, required: true },
  ID: { type: String, required: true },
});
const data = new mongoose.Schema<PackageData>({
  Content: { type: String, required: false },
  URL: { type: String, required: false },
  JSProgram: { type: String, required: false },
});
const packdata = new mongoose.Schema<Package>({
  metadata: { type: meta, required: true },
  data: { type: data, required: true },
});
const packages = mongoose.model("package", packdata);
// Create a package when DELETE /reset is schema
resetRouter.delete("/", authorizeUser, async (req: Request, res: Response) => {
  logger.info("DELETE /reset");

  let auth: string;
  try {
    logger.info("Request body: " + req.headers);
    // TODO: check authorization

    // TODO: reset registry

    // let test1 = new packages({
    //   metadata: { Name: "test", Version: "1.01", ID: "420" },
    //   data: { Content: "abc", URL: "urmom.com" },
    // });
    // await connectToMongo();
    // await test1.save();
    // await disconnectFromMongo();

    if (req.headers["auth"]) {
      //await connectToMongo();
      await packages.deleteMany({});
      //await disconnectFromMongo();
      logger.info("await mongo");
      res.status(200).send("Registry is reset");
    }
    res.status(401).send("You do not have permission to reset the registry.");
  } catch {
    // Request body is not valid JSON
    logger.info("Invalid JSON for DELETE /reset");
  }

  // Validate with joi (trivial example)
});

// module.exports = resetRouter;
