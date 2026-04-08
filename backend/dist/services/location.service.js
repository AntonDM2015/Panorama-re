"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCampusLocations = getCampusLocations;
exports.getCampusLocationById = getCampusLocationById;
exports.createCampusLocationWithPanorama = createCampusLocationWithPanorama;
exports.updateCampusLocationById = updateCampusLocationById;
exports.deleteCampusLocationById = deleteCampusLocationById;
const http_errors_1 = __importDefault(require("http-errors"));
const location_repository_1 = require("../repositories/location.repository");
function toCampusLocationDto(entity) {
    return {
        id: entity.id,
        name: entity.name,
        description: entity.description,
        panoramaUrl: entity.panoramaUrl,
        previewUrl: entity.previewUrl,
        createdAt: entity.createdAt.toISOString(),
    };
}
async function getCampusLocations() {
    const locations = await (0, location_repository_1.listCampusLocations)();
    return locations.map(toCampusLocationDto);
}
async function getCampusLocationById(locationId) {
    const location = await (0, location_repository_1.findCampusLocationById)(locationId);
    if (!location) {
        throw (0, http_errors_1.default)(404, "Campus location not found");
    }
    return toCampusLocationDto(location);
}
async function createCampusLocationWithPanorama(params) {
    const location = await (0, location_repository_1.createCampusLocation)({
        name: params.name,
        description: params.description,
        panoramaUrl: params.panoramaUrl,
        previewUrl: params.previewUrl,
    });
    return toCampusLocationDto(location);
}
async function updateCampusLocationById(locationId, params) {
    const location = await (0, location_repository_1.updateCampusLocation)(locationId, params);
    if (!location) {
        throw (0, http_errors_1.default)(404, "Campus location not found");
    }
    return toCampusLocationDto(location);
}
async function deleteCampusLocationById(locationId) {
    const isDeleted = await (0, location_repository_1.deleteCampusLocation)(locationId);
    if (!isDeleted) {
        throw (0, http_errors_1.default)(404, "Campus location not found");
    }
}
