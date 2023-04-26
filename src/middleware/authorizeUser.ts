const express = require("express");

import { Request, Response, NextFunction } from "express";
import { logger } from "../logging";
import { User } from "../model/user";
import mongoose from "mongoose";
const jwt = require("jsonwebtoken");
import { ProfileModel } from "../model/user";
import { verifyPassword } from "./hashfunc";
export const authorizeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // let data2 = new ProfileModel({
  //   User: {
  //     name: "test name",
  //     isAdmin: true,
  //     isUpload: true,
  //     isDownload: true,
  //     isSearch: true,
  //   },
  //   Secret: { password: "ur mom" },
  // });
  // data2.save();
  // Authentication failed: status 403
  // req.body.authorized = false;
  let match: Number = 0;
  logger.info("authorizeUser: Authorizing user...");
  let auth: string = req.header("X-Authorization") || "";
  logger.info("authorizeUser: Auth received " + auth);
  auth = auth.replace("bearer ", "");
  auth = auth.replace("Bearer ", "");
  res.locals.auth = false;
  try {
    if (auth) {
      try {
        let test: any = await jwt.verify(auth, "B0!l3r-Up!");
        const query = ProfileModel.find();
        query.or([
          {
            "User.name": test.data.User.name,
          },
          { "Secret.password": test.data.Secret.password },
        ]);
        const data = await query.findOne();
        if (data != null) {
          if (verifyPassword(test.data.Secret.password, data.Secret.password)) {
            if (data.User.name == test.data.User.name) {
              if (data.User.isAdmin) {
                res.locals.isAdmin = true;
                match = 1;
              } else {
                res.locals.isAdmin = false;
              }
              if (data.User.isUpload) {
                res.locals.upload = true;
                match = 1;
              } else {
                res.locals.upload = false;
              }
              if (data.User.isSearch) {
                res.locals.search = true;
                match = 1;
              } else {
                res.locals.search = false;
              }
              if (data.User.isDownload) {
                res.locals.download = true;
                match = 1;
              } else {
                res.locals.download = false;
              }
              res.locals.auth = true;
              res.locals.username = test.data.User.name;
              next();
              logger.info("auth success");
            }
          }
        }
        if (match != 1) {
          return res.status(400).send("Invalid Token");
        }
      } catch (error) {
        logger.debug(error);
        return res.status(400).send("Invalid Token");
      }
    } else if (req.body.User && req.body.Secret) {
      const query = ProfileModel.find();
      query.or([
        {
          "User.name": req.body.User.name,
        },
        { "Secret.password": req.body.Secret.password },
      ]);
      const data = await query.findOne();
      if (data != null) {
        if (
          req.body.User.name == data.User.name &&
          verifyPassword(req.body.Secret.password, data.Secret.password)
        ) {
          match = 1;
          if (data.User.isAdmin) {
            res.locals.isAdmin = true;
            match = 1;
          } else {
            res.locals.isAdmin = false;
          }
          if (data.User.isUpload) {
            res.locals.upload = true;
            match = 1;
          } else {
            res.locals.upload = false;
          }
          if (data.User.isSearch) {
            res.locals.search = true;
            match = 1;
          } else {
            res.locals.search = false;
          }
          if (data.User.isDownload) {
            res.locals.download = true;
            match = 1;
          } else {
            res.locals.download = false;
          }
          res.locals.auth = true;
          match = 1;
          res.locals.username = req.body.User.name;
          next();
        }
      }
      if (match != 1) {
        return res.status(401).send("Invalid user name or passwords");
      }
    } else {
      return res
        .status(400)
        .send(
          "There is missing field(s) in the AuthenticationRequest or it is not formed properly"
        );
    }
  } catch (error) {
    logger.info(error);
    return;
  }

  //next();
};

// module.exports = authorizeUser;
