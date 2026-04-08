import createHttpError from "http-errors";
import { env } from "../config/env";
import { supabaseAdmin } from "../config/supabase";

function buildStoragePath(originalFileName: string): string {
  const safeName = originalFileName.replace(/\s+/g, "-").toLowerCase();
  const timestamp = Date.now();
  return `panoramas/${timestamp}-${safeName}`;
}

export async function uploadPanoramaFile(params: {
  fileBuffer: Buffer;
  mimeType: string;
  originalFileName: string;
}): Promise<{ storagePath: string; publicUrl: string }> {
  const storagePath = buildStoragePath(params.originalFileName);

  const { error } = await supabaseAdmin.storage.from(env.SUPABASE_BUCKET).upload(storagePath, params.fileBuffer, {
    contentType: params.mimeType,
    upsert: false,
  });

  if (error) {
    throw createHttpError(500, `Failed to upload panorama file: ${error.message}`);
  }

  const { data } = supabaseAdmin.storage.from(env.SUPABASE_BUCKET).getPublicUrl(storagePath);

  return {
    storagePath,
    publicUrl: data.publicUrl,
  };
}

export function getPanoramaPublicUrl(storagePath: string): string {
  const { data } = supabaseAdmin.storage.from(env.SUPABASE_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}
