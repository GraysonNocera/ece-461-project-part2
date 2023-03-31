let express = require('express');
let path = require('path');
import { logger } from '../logging';
import { PackageData } from "./model/packageData";

const packageRouter = require('./route/package.route');
const authRouter = require('./route/authenticate.route');
const packagesRouter = require('./route/packages.route');
const resetRouter = require('./route/reset.route');

// define app
const app = express();

logger.info("Starting up the API server...");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get('/', (req, res, next) => {
    res.send('respond with a resource');
});

// Endpoints
app.use('/package', packageRouter);
app.use('/authenticate', authRouter);
app.use('/packages', packagesRouter);
app.use('/reset', resetRouter);

app.listen(3000, () => {
  logger.info("API server listening on port 3000");
})

export let packages: PackageData[] = [];
