import { Router } from "express";
import { authorizeUser } from "../middleware/authorizeUser";
import { logger } from "../logging";
import { Request, Response } from "express";
import { AuthenticationRequest } from "../model/authenticationRequest";
import { AuthenticationToken } from "../model/authenticationToken";
const express = require("express");
const jwt = require("jsonwebtoken");
export const authRouter: Router = express.Router();

// Create a package when PUT /authenticate is called
authRouter.put("/", authorizeUser, (req: Request, res: Response) => {
  logger.info("\nPUT /authenticate");

  let authData: AuthenticationRequest;
  let authToken: AuthenticationToken;
  try {
    authData = req.body;
    logger.info("Auth data: " + JSON.stringify(authData));
    // TODO: encrypt user password
    authToken = {
      Token: jwt.sign({ data: authData }, "B0!l3r-Up!", {
        expiresIn: "10h",
      }),
    };
    // authToken = { Token: authData.Secret.password };
    if (res.locals.auth) {
      logger.info("Authentication successful, returning 200");
      return res.status(200).send(authToken.Token);
    } else {
      logger.info("Authentication failed, returning 403");
      return res.status(403).send("Authentication Failed");
    }
  } catch (error) {
    // Request body is not valid JSON
    logger.info("PUT /authenticate: " + error);
    logger.info("Invalid JSON for PUT /authenticate, returning 500");
    return res.status(500).send("Internal Server Error");
  }
});

// module.exports = authRouter;
