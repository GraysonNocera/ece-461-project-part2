import { Router } from 'express';
import { authorizeUser } from '../middleware/authorize_user';
import { logger } from '../../logging';
import { PackageData } from '../model/packageData';
import { PackageMetadata } from '../model/packageMetadata';
import { Request, Response } from 'express';
import { packages } from '../app';
import Joi from 'joi';
import { PackageHistoryEntry } from '../model/packageHistoryEntry';
import { PackageRating } from '../model/packageRating';

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

packageRouter.get('/:id/rate', authorizeUser, (req: Request, res: Response) =>  {
    logger.info("GET /package/:id/rate");

    let id: number;
    let packageRate: PackageRating;
    try {
        id = parseInt(req.params.id);

        // TODO: Get the package from the database using the id

        // Fill in PackageRating 
        // TODO: Hit rate module to get this info
        packageRate = {
            BusFactor: 1,
            Correctness: 0.5,
            RampUp: 0.8,
            ResponsiveMaintainer: 0.3,
            LicenseScore: 0.1,
            /**
             * The fraction of its dependencies that are pinned to at least a specific major+minor version, e.g. version 2.3.X of a package. (If there are zero dependencies, they should receive a 1.0 rating. If there are two dependencies, one pinned to this degree, then they should receive a Â½ = 0.5 rating).
             */
            GoodPinningPractice: 1,
            /**
             * The fraction of project code that was introduced through pull requests with a code review).
            */
            GoodEngineeringProcess: 1,
        
            NetScore: 1,
        }

        // TODO: Update the database to have this rating for the given package

        // If status is 200, ok. Send 404 if package doesn't exist. 
        // Send 500 if rating module failed
        res.status(200).send(packageRate);
    } catch {
        // Request body is not valid JSON
        logger.info("Invalid JSON for GET /package/:id/rate");
    }

    // Validate with joi (trivial example)
});

module.exports = packageRouter;