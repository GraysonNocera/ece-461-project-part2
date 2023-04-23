import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";

export const Validate = (schema: ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req?.body);
    if (error) {
      return res.status(400).json("Invalid request data");
    } else {
      next();
    }
  };
};
