import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";
import { logger } from "../logging";

export const Validate = (schema: ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Validate: Validating request body")
    const { error, value } = schema.validate(req?.body);
    if (error) {
      logger.info("Validate: Invalid request data: " + error.message)
      return res.status(400).send("Invalid request data");
    } else {
      next();
    }
  };
};
