import createHttpError from "http-errors";
import { supabaseAdmin } from "./supabase";

export async function verifyDatabaseConnection(): Promise<void> {
  const { error } = await supabaseAdmin.from("locations").select("id").limit(1);

  if (error && error.code !== "PGRST116") {
    throw createHttpError(500, `Supabase connection check failed: ${error.message}`);
  }
}
