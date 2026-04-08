import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export type AuthTokenPayload = {
  userId: string;
  email: string;
  role: "student" | "admin";
};

function signToken(payload: AuthTokenPayload, secret: string, expiresIn: string): string {
  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, secret, options);
}

export function signAccessToken(payload: AuthTokenPayload): string {
  return signToken(payload, env.JWT_ACCESS_SECRET, env.JWT_ACCESS_EXPIRES_IN);
}

export function signRefreshToken(payload: AuthTokenPayload): string {
  return signToken(payload, env.JWT_REFRESH_SECRET, env.JWT_REFRESH_EXPIRES_IN);
}

function assertObjectPayload(decoded: string | JwtPayload): asserts decoded is JwtPayload {
  if (typeof decoded === "string") {
    throw new Error("Invalid token payload format");
  }
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  assertObjectPayload(decoded);

  return {
    userId: String(decoded.userId),
    email: String(decoded.email),
    role: decoded.role === "admin" ? "admin" : "student",
  };
}

export function verifyRefreshToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
  assertObjectPayload(decoded);

  return {
    userId: String(decoded.userId),
    email: String(decoded.email),
    role: decoded.role === "admin" ? "admin" : "student",
  };
}
