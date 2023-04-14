import { Router } from 'express';
import { authorizeUser } from '../middleware/authorize_user';
import { logger } from '../logging';
import { Request, Response } from 'express';
import Joi from 'joi';
import { AuthenticationRequest } from '../model/authenticationRequest';
import { AuthenticationToken } from '../model/authenticationToken';
const express = require('express');
const jwt = require("jsonwebtoken");
export const authRouter: Router = express.Router();

// THIS IS ONLY NEEDED FOR THE TOKEN REQUIREMENT, WHICH I THINK WE DROPPED
// SO MAYBE WE WON'T NEED THIS AND THE X-AUTHORIZATION HEADER

// This ensures that Content, URL, and JSProgram are all inputted as strings
const schema = Joi.object({
  Content: Joi.string(),
  URL: Joi.string(),
  JSProgram: Joi.string(),
});

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
    if (req.body.authorized) {
      res.status(200).send(authToken);
    } else {
      res.status(403).send("Authentication Failed");
    }
  } catch (error) {
    // Request body is not valid JSON
    logger.info(error);
    logger.info("Invalid JSON for PUT /authenticate");
  }

  res.status(500).send("Internal Server Error");

  // Validate with joi (trivial example)
});

// module.exports = authRouter;
