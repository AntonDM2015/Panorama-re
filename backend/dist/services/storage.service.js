"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPanoramaFile = uploadPanoramaFile;
exports.getPanoramaPublicUrl = getPanoramaPublicUrl;
const http_errors_1 = __importDefault(require("http-errors"));
const env_1 = require("../config/env");
const supabase_1 = require("../config/supabase");
function buildStoragePath(originalFileName) {
    const safeName = originalFileName.replace(/\s+/g, "-").toLowerCase();
    const timestamp = Date.now();
    return `panoramas/${timestamp}-${safeName}`;
}
async function uploadPanoramaFile(params) {
    const storagePath = buildStoragePath(params.originalFileName);
    const { error } = await supabase_1.supabaseAdmin.storage.from(env_1.env.SUPABASE_BUCKET).upload(storagePath, params.fileBuffer, {
        contentType: params.mimeType,
        upsert: false,
    });
    if (error) {
        throw (0, http_errors_1.default)(500, `Failed to upload panorama file: ${error.message}`);
    }
    const { data } = supabase_1.supabaseAdmin.storage.from(env_1.env.SUPABASE_BUCKET).getPublicUrl(storagePath);
    return {
        storagePath,
        publicUrl: data.publicUrl,
    };
}
function getPanoramaPublicUrl(storagePath) {
    const { data } = supabase_1.supabaseAdmin.storage.from(env_1.env.SUPABASE_BUCKET).getPublicUrl(storagePath);
    return data.publicUrl;
}
