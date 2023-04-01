import { Router } from 'express';
import { authorizeUser } from '../middleware/authorize_user';
import { logger } from '../../logging';
import { Request, Response } from 'express';
import Joi from 'joi';
const express = require('express');

export const resetRouter: Router = express.Router();

// This ensures that Content, URL, and JSProgram are all inputted as strings
const schema = Joi.object({
    Content: Joi.string(),
    URL: Joi.string(),
    JSProgram: Joi.string(),
});

// Create a package when DELETE /reset is called
resetRouter.delete('/', authorizeUser, (req: Request, res: Response) =>  {
    logger.info("DELETE /reset");

    let auth: string;
    try {
        logger.info("Request body: " + req.headers);
        auth = req.header('X-Authorization') || "";
        logger.info("Auth data: " + auth);
        // TODO: check authorization

        // TODO: reset registry

        // 200: reset successful
        // 401: unauthorized
        res.status(200).send("Registry is reset");

        res.status(401).send("You do not have permission to reset the registry.");
    } catch {
        // Request body is not valid JSON
        logger.info("Invalid JSON for DELETE /reset");
    }

    // Validate with joi (trivial example)
});

// module.exports = resetRouter;
