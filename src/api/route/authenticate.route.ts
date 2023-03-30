import { Router } from 'express';
import { authorizeUser } from '../middleware/authorize_user';
import { logger } from '../../logging';
import { Request, Response } from 'express';
import Joi from 'joi';
import { AuthenticationRequest } from '../model/authenticationRequest';
import { AuthenticationToken } from '../model/authenticationToken';
const express = require('express');

const authRouter: Router = express.Router();

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

module.exports = authRouter;