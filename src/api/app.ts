let createError = require('http-errors');
let express = require('express');
let path = require('path');
import { logger } from '../logging';
const packageRouter = require('./route/package.route');

const app = express();

logger.info("Starting up the API server...");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get('/', (req, res, next) => {
    res.send('respond with a resource');
});
app.use('/package', packageRouter);

app.listen(3000, () => {
  logger.info("API server listening on port 3000");
})
