import { Router } from "express";
import { authorizeUser } from "../middleware/authorizeUser";
import { logger } from "../logging";
import { Request, Response } from "express";
import { ProfileModel } from "../model/user";
import { hashPassword } from "./hashfunc";
const express = require("express");

export const userRouter: Router = express.Router();

userRouter.delete("/", authorizeUser, async (req: Request, res: Response) => {
  logger.info("DELETE /user");
  try {
    if (res.locals.isAdmin) {
      // const query = PackageModel.where({ _id: id });
      // const package_received = await query.findOne();
      const query = ProfileModel.find();
      query.or([
        {
          "User.name": req.body.User.name,
        },
      ]);
      let test = await query.deleteOne();
      if (test.acknowledged) {
        return res.status(200).send("User profile successfuly deleted");
      }
    } else if (res.locals.username == req.body.User.name) {
      const query = ProfileModel.find();
      query.or([
        {
          "User.name": req.body.User.name,
        },
      ]);
      let test = await query.deleteOne();
      if (test.acknowledged) {
        return res.status(200).send("User profile successfuly deleted");
      }
    } else {
      return res
        .status(401)
        .send("You don't have the proper permissions to delete this account");
    }

    // add in stuff for checking admin if not admin check if user is the same as the profile trying to be deleted if not any of that then return no rights
  } catch (error) {
    logger.info("Internal Error");
  }
});

userRouter.post("/", authorizeUser, async (req: Request, res: Response) => {
  logger.info("POST /user");
  try {
    if (res.locals.isAdmin) {
      const hashedPassword = hashPassword(req.body.Secret.password);
      let account = new ProfileModel({
        User: {
          name: req.body.User.name,
          isAdmin: req.body.User.isAdmin,
          isUpload: req.body.User.isUpload,
          isDownload: req.body.User.isDownload,
          isSearch: req.body.User.isSearch,
        },
        Secret: { password: hashedPassword },
      });
      await account.save();
      return res.status(200).send("Account successfully created");
    } else {
      return res
        .status(401)
        .send("You don't have proper permissions to add an account");
    }
  } catch (error) {
    logger.info("Internal Error");
  }
});
