import { Router } from 'express';
import { authorizeUser } from '../middleware/authorize_user';
import { logger } from '../../logging';
import { PackageData } from '../model/packageData';
import { PackageMetadata } from '../model/packageMetadata';
import { Request, Response } from 'express';
import { packages } from '../app';
import Joi from 'joi';
import { PackageHistoryEntry } from '../model/packageHistoryEntry';

const express = require('express');

const packageRouter: Router = express.Router();

// This ensures that Content, URL, and JSProgram are all inputted as strings
const schema = Joi.object({
    Content: Joi.string(),
    URL: Joi.string(),
    JSProgram: Joi.string(),
});

// Create a package when POST /package is called
packageRouter.post('/', authorizeUser, (req: Request, res: Response) =>  {
    logger.info("POST /package");

    let packageData: PackageData = {};
    try {
        packageData = req.body;
        logger.info("Package data: " + JSON.stringify(packageData));
    } catch {
        // Request body is not valid JSON
        logger.info("Invalid JSON for POST /package");
    }

    // Validate with joi (trivial example)
    const { error, value } = schema.validate(packageData);
    if (error) {
        // Request body is not valid
    }

    // Check the inputted data

    // Package already exists: status 409
    
    // Package not updated due to disqualified rating: status 423

    // Success: status 201

    // Get metadata from package (from APIS?)
    let metadata: PackageMetadata = {
        Name: "test",
        Version: "1.0.0",
        ID: "1234",
    }
    
    // Store this package in database
    // for now, just store it in memory
    packages.push(packageData);

    logger.info("POST /package: Package created successfully");
    res.status(201).send({
        "metadata": metadata,
        "data": {
            "Content": packageData.Content,
            "JSProgram": packageData.JSProgram,
        }
    });
});

// Create a package when GET /package/byName/{name} is called
packageRouter.get('/byName/:name', authorizeUser, (req: Request, res: Response) =>  {
    logger.info("GET /package/byName/{name}");

    let name: string;
    let packageHistoryEntry: PackageHistoryEntry;
    try {
        name = req.params.name;
        logger.info("package name :" + name);

        // TODO: Hit database to get package version information
        packageHistoryEntry = {
            User: {
                name: name,
                isAdmin: true,
            },
            Date: "2021-04-01",
            PackageMetadata: {
                Name: "test package metadata",
                Version: "1.0.0",
                ID: "1234",
            },
            Action: PackageHistoryEntry.ActionEnum.Create,
        }

        res.status(200).send([packageHistoryEntry, packageHistoryEntry]);
    } catch {
        // Request body is not valid JSON
        logger.info("Invalid JSON for GET /package/byName/{name}");
    }

    // Validate with joi (trivial example)
});


module.exports = packageRouter;