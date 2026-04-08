import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { verifyAccessToken } from "../utils/jwt";

function extractBearerToken(authorizationHeader?: string): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    throw createHttpError(401, "Authorization token is required");
  }

  try {
    const payload = verifyAccessToken(token);

    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    throw createHttpError(401, "Invalid or expired access token", { cause: error });
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    throw createHttpError(401, "Unauthorized");
  }

  if (req.user.role !== "admin") {
    throw createHttpError(403, "Admin permissions required");
  }

  next();
}
