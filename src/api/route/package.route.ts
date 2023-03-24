import { Router } from 'express';
const express = require('express');

const packageRouter: Router = express.Router();
packageRouter.get('/', (req, res) =>  {
    res.send('hello there\n');
});

module.exports = packageRouter;