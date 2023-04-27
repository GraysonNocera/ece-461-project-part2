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
  logger.info("PUT /authenticate");

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
      res.status(200).send(authToken.Token);
    } else {
      res.status(403).send("Authentication Failed");
    }
  } catch (error) {
    // Request body is not valid JSON
    logger.info(error);
    logger.info("Invalid JSON for PUT /authenticate");
    res.status(500).send("Internal Server Error");
  }

  // Validate with joi (trivial example)
});

// module.exports = authRouter;
