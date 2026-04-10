import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { ZodError } from "zod";

type ErrorWithStatus = Error & {
  status?: number;
};

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(createHttpError(404, "Route not found"));
}

export function errorHandler(
  error: ErrorWithStatus,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log actual error for debugging
  console.error('[ERROR HANDLER]', error);

  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Validation failed",
      details: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  const status = error.status ?? 500;
  const message = status >= 500 ? "Internal server error" : error.message;

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { error: error.message }),
  });
}
