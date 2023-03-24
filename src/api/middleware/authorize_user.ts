const express = require('express');
import { Request, Response, NextFunction } from 'express';
import { logger } from '../../logging';

export const authorizeUser = (req: Request, res: Response, next: NextFunction) => {
    // Authentication failed: status 403

    logger.info("authorizeUser: Authorizing user...");
    // req.body.authorized = true;
    next();
}

// module.exports = authorizeUser;