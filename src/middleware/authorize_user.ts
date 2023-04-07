const express = require("express");

import { Request, Response, NextFunction } from "express";
import { logger } from "../logging";
import { User } from "../model/user";
const jwt = require("jsonwebtoken");
export const authorizeUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Authentication failed: status 403
  // req.body.authorized = false;
  logger.info("authorizeUser: Authorizing user...");
  //logger.info(JSON.stringify(req.body));
  let auth: string = req.header("X-Authorization") || "";
  logger.info(auth);
  try {
    if (auth != "") {
      try {
        let test: string = jwt.verify(auth, "yourmomma.com");
        logger.info(test);
        if (test == "ur mom") {
          req.body.authorized = true;
          logger.info("authorized");
          next();
        } else {
          res.status(400).send("Invalid Token");
        }
      } catch (error) {
        logger.info(error);
        res.status(400).send("Invalid Token");
      }
    }
    if (req.body.User.name && req.body.Secret.password) {
      if (
        req.body.User.name == "test name" &&
        req.body.Secret.password == "ur mom"
      ) {
        req.body.authorized = true;
        next();
      } else {
        res.status(401).send("Invalid user name or password");
      }
    } else {
      res
        .status(400)
        .send(
          "There is missing field(s) in the AuthenticationRequest or it is not formed properly"
        );
    }
  } catch (error) {}

  //next();
};

// module.exports = authorizeUser;
