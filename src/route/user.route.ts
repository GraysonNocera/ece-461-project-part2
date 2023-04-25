import { Router } from "express";
import { authorizeUser } from "../middleware/authorizeUser";
import { logger } from "../logging";
import { Request, Response } from "express";
import { ProfileModel } from "../model/user";
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
        logger.info("DELETE /user: User profile successfuly deleted, got result: " + test);
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
        logger.info("DELETE /user: User profile successfuly deleted, got result: " + test);
        return res.status(200).send("User profile successfuly deleted");
      }
    } else {
      logger.debug("DELETE /user: User is not admin or the user trying to delete their account")
      return res
        .status(401)
        .send("You don't have the proper permissions to delete this account");
    }

    // add in stuff for checking admin if not admin check if user is the same as the profile trying to be deleted if not any of that then return no rights
  } catch (error) {
    logger.info("Internal Error");
    return res.status(400).send("Error somewhere");
  }
});

userRouter.post("/", authorizeUser, async (req: Request, res: Response) => {
  logger.info("POST /user");
  try {
    //add in stuff for checking admin and creating new user
    if (res.locals.isAdmin) {
      let account = new ProfileModel({
        User: {
          name: req.body.User.name,
          isAdmin: req.body.User.isAdmin,
          isUpload: req.body.User.isUpload,
          isDownload: req.body.User.isDownload,
          isSearch: req.body.User.isSearch,
        },
        Secret: { password: req.body.Secret.password },
      });
      await account.save();

      logger.info("POST /user: Account successfully created")
      return res.status(200).send("Account successfully created");
    } else {

      logger.debug("POST /user: User is not admin")

      return res
        .status(401)
        .send("You don't have proper permissions to add an account");
    }
  } catch (error) {
    logger.info("Internal Error");
    return res.status(400).send("Error");
  }
});
