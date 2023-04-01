import { Router } from 'express';
import { authorizeUser } from '../middleware/authorize_user';
import { logger } from '../../logging';
import { Request, Response } from 'express';
import Joi from 'joi';
import { AuthenticationRequest } from '../model/authenticationRequest';
import { AuthenticationToken } from '../model/authenticationToken';
const express = require('express');

export const authRouter: Router = express.Router();

// THIS IS ONLY NEEDED FOR THE TOKEN REQUIREMENT, WHICH I THINK WE DROPPED
// SO MAYBE WE WON'T NEED THIS AND THE X-AUTHORIZATION HEADER

// This ensures that Content, URL, and JSProgram are all inputted as strings
const schema = Joi.object({
    Content: Joi.string(),
    URL: Joi.string(),
    JSProgram: Joi.string(),
});

// Create a package when POST /package is called
authRouter.put('/', authorizeUser, (req: Request, res: Response) =>  {
    logger.info("PUT /authenticate");

    let authData: AuthenticationRequest;
    let authToken: AuthenticationToken;
    try {
        authData = req.body;
        logger.info("Auth data: " + JSON.stringify(authData));

        // TODO: encrypt user password
        authToken = { Token: authData.Secret.password };

        res.status(200).send(authToken);
    } catch {
        // Request body is not valid JSON
        logger.info("Invalid JSON for PUT /authenticate");
    }

    // Validate with joi (trivial example)
});

// module.exports = authRouter;
