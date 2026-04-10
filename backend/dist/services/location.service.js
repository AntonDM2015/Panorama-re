"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationService = void 0;
const location_repository_1 = require("../repositories/location.repository");
const panorama_repository_1 = require("../repositories/panorama.repository");
const panorama_link_repository_1 = require("../repositories/panorama_link.repository");
const storage_service_1 = require("./storage.service");
const locationRepo = new location_repository_1.LocationRepository();
const panoramaRepo = new panorama_repository_1.PanoramaRepository();
const panoramaLinkRepo = new panorama_link_repository_1.PanoramaLinkRepository();
class LocationService {
    async getAllLocations() {
        return locationRepo.getAll();
    }
    async getLocationsByBuilding(buildingId) {
        return locationRepo.getByBuildingId(buildingId);
    }
    async getLocationById(id) {
        const location = await locationRepo.getById(id);
        if (!location)
            return null;
        // Load panoramas for this location
        const panoramas = await panoramaRepo.getByLocationId(id);
        location.panoramas = panoramas;
        // Load navigation links (optional logic can be placed here if needed)
        // Note: Panorama links are now fetched per-panorama or fetched individually when needed.
        return location;
    }
    async createLocation(data) {
        return locationRepo.create(data);
    }
    async updateLocation(id, updates) {
        return locationRepo.update(id, updates);
    }
    async deleteLocation(id) {
        // Delete all panoramas for this location first
        await panoramaRepo.deleteByLocationId(id);
        // Then delete the location
        await locationRepo.delete(id);
    }
    async uploadPanoramaImage(locationId, file) {
        // Verify location exists
        const location = await locationRepo.getById(locationId);
        if (!location) {
            throw new Error('Location not found');
        }
        // Upload to storage
        const { publicUrl } = await (0, storage_service_1.uploadPanoramaFile)({
            fileBuffer: file.buffer,
            mimeType: file.mimetype,
            originalFileName: file.originalname,
        });
        // Save panorama record
        await panoramaRepo.create({
            locationId,
            url: publicUrl,
            title: file.originalname,
        });
        return { url: publicUrl };
    }
    // Panorama management
    async getAllPanoramas() {
        return panoramaRepo.getAll();
    }
    async getLocationPanoramas(locationId) {
        return panoramaRepo.getByLocationId(locationId);
    }
    async createPanorama(data) {
        return panoramaRepo.create(data);
    }
    async updatePanorama(id, updates) {
        return panoramaRepo.update(id, updates);
    }
    async deletePanorama(id) {
        return panoramaRepo.delete(id);
    }
    // Panorama links management
    async getPanoramaLinks(panoramaId) {
        return panoramaLinkRepo.getByPanoramaId(panoramaId);
    }
    async createPanoramaLink(data) {
        return panoramaLinkRepo.create(data);
    }
    async deletePanoramaLink(id) {
        return panoramaLinkRepo.delete(id);
    }
}
exports.LocationService = LocationService;
