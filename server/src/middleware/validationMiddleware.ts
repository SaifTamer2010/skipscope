import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * Middleware to validate request body against a Zod schema
 */
export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Validation error",
          details: error.issues.map((e: any) => ({
            path: e.path,
            message: e.message,
          })),
        });
      }
      return res.status(500).json({ error: "Internal server error during validation" });
    }
  };
};
