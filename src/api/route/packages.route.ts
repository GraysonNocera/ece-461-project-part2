import { Router } from 'express';
import { authorizeUser } from '../middleware/authorize_user';
import { logger } from '../../logging';
import { PackageData } from '../model/packageData';
import { PackageMetadata } from '../model/packageMetadata';
import { Request, Response } from 'express';
import { packages } from '../app';
import Joi from 'joi';
import { PackageHistoryEntry } from '../model/packageHistoryEntry';
import { PackageQuery } from '../model/packageQuery';

const express = require('express');
export const packagesRouter: Router = express.Router();

// Create a package when POST /packages is called
packagesRouter.post('/', authorizeUser, (req: Request, res: Response) =>  {
    logger.info("POST /packages");

    let offset: Number;
    let packageQuery: PackageQuery;
    let packageMetadata: PackageMetadata;
    let returnObject;
    try {
        offset = Number(req.query.offset) || 0;
        logger.info("package offset: " + offset);
        packageQuery = req.body;

        // TODO: Search database for packages matching the query
        packageMetadata = {
            Name: packageQuery.Name,
            Version: packageQuery.Version || "1.0.0",
            ID: "1234567890",
        }

        returnObject = {
            Version: packageQuery.Version || "1.0.0",
            Name: packageQuery.Name,
        }
        res.status(200).send([returnObject, returnObject]);
    } catch {
        // Request body is not valid JSON
        logger.info("Invalid JSON for POST /packages");
    }

    // Validate with joi (trivial example)
});

// module.exports = packagesRouter;
