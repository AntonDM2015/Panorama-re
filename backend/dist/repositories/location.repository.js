"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCampusLocations = listCampusLocations;
exports.findCampusLocationById = findCampusLocationById;
exports.createCampusLocation = createCampusLocation;
exports.updateCampusLocation = updateCampusLocation;
exports.deleteCampusLocation = deleteCampusLocation;
const http_errors_1 = __importDefault(require("http-errors"));
const supabase_1 = require("../config/supabase");
function mapLocationRow(row) {
    return {
        id: row.id,
        name: row.name,
        description: row.description,
        panoramaUrl: row.panorama_url,
        previewUrl: row.preview_url,
        createdAt: new Date(row.created_at),
    };
}
async function listCampusLocations() {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("locations")
        .select("id, name, description, panorama_url, preview_url, created_at")
        .order("created_at", { ascending: false });
    if (error) {
        throw (0, http_errors_1.default)(500, `Failed to list locations: ${error.message}`);
    }
    return (data ?? []).map((row) => mapLocationRow(row));
}
async function findCampusLocationById(locationId) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("locations")
        .select("id, name, description, panorama_url, preview_url, created_at")
        .eq("id", locationId)
        .maybeSingle();
    if (error) {
        throw (0, http_errors_1.default)(500, `Failed to fetch location: ${error.message}`);
    }
    if (!data) {
        return null;
    }
    return mapLocationRow(data);
}
async function createCampusLocation(params) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("locations")
        .insert({
        name: params.name,
        description: params.description,
        panorama_url: params.panoramaUrl,
        preview_url: params.previewUrl,
    })
        .select("id, name, description, panorama_url, preview_url, created_at")
        .single();
    if (error) {
        throw (0, http_errors_1.default)(500, `Failed to create location: ${error.message}`);
    }
    return mapLocationRow(data);
}
async function updateCampusLocation(locationId, params) {
    const updatePayload = {};
    if (typeof params.name === "string") {
        updatePayload.name = params.name;
    }
    if (typeof params.description === "string") {
        updatePayload.description = params.description;
    }
    if (typeof params.panoramaUrl === "string") {
        updatePayload.panorama_url = params.panoramaUrl;
    }
    if (typeof params.previewUrl === "string") {
        updatePayload.preview_url = params.previewUrl;
    }
    const { data, error } = await supabase_1.supabaseAdmin
        .from("locations")
        .update(updatePayload)
        .eq("id", locationId)
        .select("id, name, description, panorama_url, preview_url, created_at")
        .maybeSingle();
    if (error) {
        throw (0, http_errors_1.default)(500, `Failed to update location: ${error.message}`);
    }
    if (!data) {
        return null;
    }
    return mapLocationRow(data);
}
async function deleteCampusLocation(locationId) {
    const { error, count } = await supabase_1.supabaseAdmin
        .from("locations")
        .delete({ count: "exact" })
        .eq("id", locationId);
    if (error) {
        throw (0, http_errors_1.default)(500, `Failed to delete location: ${error.message}`);
    }
    return Boolean(count && count > 0);
}
