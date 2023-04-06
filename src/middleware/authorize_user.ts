const express = require("express");

import { Request, Response, NextFunction } from "express";
import { logger } from "../logging";
import { User } from "../model/user";

export const authorizeUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Authentication failed: status 403

  logger.info("authorizeUser: Authorizing user...");
  logger.info(JSON.stringify(req.body));
  //   let data: any = JSON.parse(req.body);
  if (
    req.body.User.name == "test name" &&
    req.body.Secret.password == "test password"
  ) {
    req.body.authorized = true;
  }

  next();
};

// module.exports = authorizeUser;
