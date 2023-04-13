const express = require("express");

import { Request, Response, NextFunction } from "express";
import { logger } from "../logging";
import { User } from "../model/user";
import { readFileSync } from "fs";
import mongoose from "mongoose";
import { UserAuthenticationInfo } from "../model/userAuthenticationInfo";
const jwt = require("jsonwebtoken");

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
const info = mongoose.model("user", userdata);


export const authorizeUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Authentication failed: status 403
  // req.body.authorized = false;

  const file = readFileSync(__dirname + "/key.json", "utf8");
  let data = JSON.parse(file);
  logger.info("authorizeUser: Authorizing user...");
  //logger.info(JSON.stringify(req.body));
  let auth: string = req.header("X-Authorization") || "";
  logger.info("authorizeUser: Auth received " + auth);

  try {
    if (auth != "") {
      try {
        let test: string = jwt.verify(auth, "B0!l3r-Up!");

        for (let x in data) {
          if (test == data[x].Secret.password) {
            if (data[x].User.isAdmin) {
              req.body.authorized = true;
            } else {
              req.body.authorized = false;
            }
            next();
          }
        }
        res.status(400).send("Invalid Token");
      } catch (error) {
        logger.debug(error);
        res.status(400).send("Invalid Token");
      }
    }
    if (req.body.User.name && req.body.Secret.password) {
      for (let x in data) {
        if (
          req.body.User.name == data[x].User.name &&
          req.body.Secret.password == data[x].Secret.password
        ) {
          if (data[x].User.isAdmin) {
            req.body.authorized = true;
          } else {
            req.body.authorized = false;
          }
          next();
        }
      }
      res.status(401).send("Invalid user name or password");
    } else {
      res
        .status(400)
        .send(
          "There is missing field(s) in the AuthenticationRequest or it is not formed properly"
        );
    }
  } catch (error) {

    logger.debug(error);
  }

  //next();
};

// module.exports = authorizeUser;
