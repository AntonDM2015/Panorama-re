import bcrypt from "bcryptjs";
import createHttpError from "http-errors";
import { createUser, findUserByEmail, UserEntity } from "../repositories/user.repository";
import { signAccessToken, signRefreshToken } from "../utils/jwt";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthUser = {
  id: string;
  email: string;
  role: "student" | "admin";
  createdAt: Date;
};

function mapAuthUser(user: UserEntity): AuthUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

function buildTokens(user: UserEntity): AuthTokens {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

export async function registerUser(params: {
  email: string;
  password: string;
  role?: "student" | "admin";
}): Promise<{ user: AuthUser; tokens: AuthTokens }> {
  const normalizedEmail = params.email.trim().toLowerCase();
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw createHttpError(409, "User with this email already exists");
  }

  const passwordHash = await bcrypt.hash(params.password, 12);
  const user = await createUser({
    email: normalizedEmail,
    passwordHash,
    role: params.role ?? "student",
  });

  return {
    user: mapAuthUser(user),
    tokens: buildTokens(user),
  };
}

export async function loginUser(params: {
  email: string;
  password: string;
}): Promise<{ user: AuthUser; tokens: AuthTokens }> {
  const normalizedEmail = params.email.trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    throw createHttpError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(params.password, user.passwordHash);

  if (!isPasswordValid) {
    throw createHttpError(401, "Invalid email or password");
  }

  return {
    user: mapAuthUser(user),
    tokens: buildTokens(user),
  };
}
