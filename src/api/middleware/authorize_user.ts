const express = require('express');
import { Request, Response, NextFunction } from 'express';
import { logger } from '../../logging';

export const authorizeUser = (req: Request, res: Response, next: NextFunction) => {
    logger.info("Authorizing user...");
    req.body.authorized = true;
    next();
}

// module.exports = authorizeUser;