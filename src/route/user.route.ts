import { Router } from "express";
import { authorizeUser } from "../middleware/authorize_user";
import { logger } from "../logging";
import { Request, Response } from "express";
import { Package } from "../model/package";
import { User } from "../model/user";
import mongoose from "mongoose";
import { PackageMetadata } from "../model/packageMetadata";
import { PackageData } from "../model/packageData";
import { connectToMongo, disconnectFromMongo } from "../config/config";
import { UserAuthenticationInfo } from "../model/userAuthenticationInfo";
const express = require("express");

export const userRouter: Router = express.Router();

const user = new mongoose.Schema<User>({
  name: { type: String, required: true },
  isAdmin: { type: Boolean, required: true },
});

const authorize = new mongoose.Schema<UserAuthenticationInfo>({
  password: { type: String, required: true },
});

const userdata = new mongoose.Schema({
  User: { type: user, required: true },
  Secret: { type: authorize, required: true },
});
const info = mongoose.model("info", userdata);

userRouter.delete("/", authorizeUser, async (req: Request, res: Request) => {
  logger.info("DELETE /user");
  try {
    // add in stuff for checking admin if not admin check if user is the same as the profile trying to be deleted if not any of that then return no rights
  } catch {
    logger.info("Internal Error");
  }
});

userRouter.post("/", authorizeUser, async (req: Request, res: Request) => {
  logger.info("POST /user");
  try {
    //add in stuff for checking admin and creating new user
  } catch {
    logger.info("Internal Error");
  }
});
