import createHttpError from "http-errors";
import { supabaseAdmin } from "../config/supabase";

export type UserEntity = {
  id: string;
  email: string;
  passwordHash: string;
  role: "student" | "admin";
  createdAt: Date;
};

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  role: "student" | "admin";
};

function mapUserRow(row: UserRow): UserEntity {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    createdAt: new Date(),
  };
}

export async function findUserByEmail(email: string): Promise<UserEntity | null> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, email, password_hash, role")
    .eq("email", email)
    .maybeSingle<UserRow>();

  if (error) {
    throw createHttpError(500, `Failed to fetch user by email: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapUserRow(data);
}

export async function findUserById(userId: string): Promise<UserEntity | null> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, email, password_hash, role")
    .eq("id", userId)
    .maybeSingle<UserRow>();

  if (error) {
    throw createHttpError(500, `Failed to fetch user by id: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapUserRow(data);
}

export async function createUser(params: {
  email: string;
  passwordHash: string;
  role?: "student" | "admin";
}): Promise<UserEntity> {
  const role = params.role ?? "student";

  const { data, error } = await supabaseAdmin
    .from("users")
    .insert({
      email: params.email,
      password_hash: params.passwordHash,
      role,
    })
    .select("id, email, password_hash, role")
    .single<UserRow>();

  if (error) {
    throw createHttpError(500, `Failed to create user: ${error.message}`);
  }

  return mapUserRow(data);
}
