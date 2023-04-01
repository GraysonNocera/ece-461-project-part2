import express from 'express';
import path from 'path';
import { logger } from '../logging';
import { PackageData } from "./model/packageData";

import { packageRouter } from './route/package.route';
import { authRouter from './route/authenticate.route';
import { packagesRouter } from './route/packages.route';
import { resetRouter } from './route/reset.route';

// define app
const app = express();

logger.info("Starting up the API server...");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get('/', (req, res, next) => {
    res.send('respond with a resource');
});,

// Endpoints
app.use('/package', packageRouter);
app.use('/authenticate', authRouter);
app.use('/packages', packagesRouter);
app.use('/reset', resetRouter);,

app.listen(3000, () => {
  logger.info("API server listening on port 3000");
})

export let packages: PackageData[] = [];
