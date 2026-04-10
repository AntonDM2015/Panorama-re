"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationController = void 0;
const location_service_1 = require("../services/location.service");
const locationService = new location_service_1.LocationService();
class LocationController {
    // GET /api/locations
    getAll = async (req, res, next) => {
        try {
            const locations = await locationService.getAllLocations();
            res.json({ locations });
        }
        catch (error) {
            next(error);
        }
    };
    // GET /api/buildings/:buildingId/locations
    getByBuilding = async (req, res, next) => {
        try {
            const locations = await locationService.getLocationsByBuilding(req.params.buildingId);
            res.json({ locations });
        }
        catch (error) {
            next(error);
        }
    };
    // GET /api/locations/:id
    getById = async (req, res, next) => {
        try {
            const location = await locationService.getLocationById(req.params.id);
            if (!location) {
                return res.status(404).json({ message: 'Локация не найдена' });
            }
            res.json({ location });
        }
        catch (error) {
            next(error);
        }
    };
    // POST /api/locations (admin only)
    create = async (req, res, next) => {
        try {
            const { buildingId, name, description, floor, type, roomNumber, previewUrl, panoramaUrl } = req.body;
            if (!buildingId || !name) {
                return res.status(400).json({ message: 'buildingId и name обязательны' });
            }
            const location = await locationService.createLocation({
                buildingId,
                name,
                description,
                floor,
                type,
                roomNumber,
                previewUrl,
                panoramaUrl,
            });
            res.status(201).json({ location });
        }
        catch (error) {
            next(error);
        }
    };
    // PUT /api/locations/:id (admin only)
    update = async (req, res, next) => {
        try {
            const { name, description, floor, type, roomNumber, previewUrl, panoramaUrl } = req.body;
            const location = await locationService.updateLocation(req.params.id, {
                name,
                description,
                floor,
                type,
                roomNumber,
                previewUrl,
                panoramaUrl,
            });
            res.json({ location });
        }
        catch (error) {
            next(error);
        }
    };
    // DELETE /api/locations/:id (admin only)
    delete = async (req, res, next) => {
        try {
            await locationService.deleteLocation(req.params.id);
            res.json({ message: 'Локация удалена' });
        }
        catch (error) {
            next(error);
        }
    };
    // GET /api/panoramas
    getAllPanoramas = async (req, res, next) => {
        try {
            const panoramas = await locationService.getAllPanoramas();
            res.json({ panoramas });
        }
        catch (error) {
            next(error);
        }
    };
    // GET /api/locations/:locationId/panoramas
    getPanoramas = async (req, res, next) => {
        try {
            const panoramas = await locationService.getLocationPanoramas(req.params.locationId);
            res.json({ panoramas });
        }
        catch (error) {
            next(error);
        }
    };
    // POST /api/locations/:locationId/panoramas (admin only)
    createPanorama = async (req, res, next) => {
        try {
            const { url, title, sortOrder } = req.body;
            if (!url) {
                return res.status(400).json({ message: 'URL панорамы обязателен' });
            }
            const panorama = await locationService.createPanorama({
                locationId: req.params.locationId,
                url,
                title,
                sortOrder,
            });
            res.status(201).json({ panorama });
        }
        catch (error) {
            next(error);
        }
    };
    // PUT /api/panoramas/:id (admin only)
    updatePanorama = async (req, res, next) => {
        try {
            const { url, title, sortOrder } = req.body;
            const panorama = await locationService.updatePanorama(req.params.id, {
                url,
                title,
                sortOrder,
            });
            res.json({ panorama });
        }
        catch (error) {
            next(error);
        }
    };
    // DELETE /api/panoramas/:id (admin only)
    deletePanorama = async (req, res, next) => {
        try {
            await locationService.deletePanorama(req.params.id);
            res.json({ message: 'Панорама удалена' });
        }
        catch (error) {
            next(error);
        }
    };
    // GET /api/panoramas/:panoramaId/links
    getPanoramaLinks = async (req, res, next) => {
        try {
            const links = await locationService.getPanoramaLinks(req.params.panoramaId);
            res.json({ links });
        }
        catch (error) {
            next(error);
        }
    };
    // POST /api/panoramas/:panoramaId/links (admin only)
    createPanoramaLink = async (req, res, next) => {
        try {
            const { toPanoramaId, direction } = req.body;
            if (!toPanoramaId) {
                return res.status(400).json({ message: 'toPanoramaId обязателен' });
            }
            console.log('[createPanoramaLink] Attempting to create link:', {
                fromPanoramaId: req.params.panoramaId,
                toPanoramaId,
                direction,
            });
            const link = await locationService.createPanoramaLink({
                fromPanoramaId: req.params.panoramaId,
                toPanoramaId,
                direction,
            });
            console.log('[createPanoramaLink] Success:', link);
            res.status(201).json({ link });
        }
        catch (error) {
            console.error('[createPanoramaLink ERROR]', error);
            next(error);
        }
    };
    // DELETE /api/panorama-links/:id (admin only)
    deletePanoramaLink = async (req, res, next) => {
        try {
            await locationService.deletePanoramaLink(req.params.id);
            res.json({ message: 'Связь удалена' });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.LocationController = LocationController;
