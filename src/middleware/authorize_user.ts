const express = require("express");

import { Request, Response, NextFunction } from "express";
import { logger } from "../logging";
import { User } from "../model/user";
import { readFileSync } from "fs";
import mongoose from "mongoose";
const jwt = require("jsonwebtoken");
import { userdata } from "../model/user";

const info = mongoose.model("user", userdata);

export const authorizeUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Authentication failed: status 403
  // req.body.authorized = false;
  let match: Number = 0;
  const file = readFileSync(__dirname + "/key.json", "utf8");
  let data = JSON.parse(file);
  logger.info("authorizeUser: Authorizing user...");
  let auth: string = req.header("X-Authorization") || "";
  logger.info(auth);
  try {
    if (auth != "") {
      try {
        let test: any = jwt.verify(auth, "B0!l3r-Up!");

        for (let x in data) {
          if (test.data.Secret.password == data[x].Secret.password) {
            if (data[x].User.name == test.data.User.name) {
              if (data[x].User.isAdmin) {
                req.headers["admin"] = true;
                match = 1;
              } else {
                req.headers["admin"] = false;
              }
              if (data[x].User.isUpload) {
                req.headers["upload"] = true;
                match = 1;
              } else {
                req.headers["upload"] = false;
              }
              if (data[x].User.isSearch) {
                req.headers["search"] = true;
                match = 1;
              } else {
                req.headers["search"] = false;
              }
              if (data[x].User.isDownload) {
                req.headers["download"] = true;
                match = 1;
              } else {
                req.headers["download"] = false;
              }
              req.headers["auth"] = true;
              next();
              logger.info("auth success");
            } else {
              req.headers["auth"] = false;
            }
          }
        }
        if (match != 1) {
          res.status(400).send("Invalid Token");
        }
      } catch (error) {
        logger.info(error);
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
            req.headers["admin"] = true;
          } else {
            req.headers["admin"] = false;
          }
          if (data[x].User.isUpload) {
            req.headers["upload"] = true;
          } else {
            req.headers["upload"] = false;
          }
          if (data[x].User.isSearch) {
            req.headers["search"] = true;
          } else {
            req.headers["search"] = false;
          }
          if (data[x].User.isDownload) {
            req.headers["download"] = true;
          } else {
            req.headers["download"] = false;
          }
          req.headers["auth"] = true;
          match = 1;
          logger.info("auth success");
          next();
        }
      }
      if (match != 1) {
        res.status(401).send("Invalid user name or passwords");
      }
      next();
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
