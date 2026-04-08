"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listLocationsController = listLocationsController;
exports.getLocationByIdController = getLocationByIdController;
exports.createLocationController = createLocationController;
exports.updateLocationController = updateLocationController;
exports.deleteLocationController = deleteLocationController;
const zod_1 = require("zod");
const location_service_1 = require("../services/location.service");
const createLocationSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(120),
    description: zod_1.z.string().min(5).max(1000),
    panoramaUrl: zod_1.z.string().url(),
    previewUrl: zod_1.z.string().url(),
});
const updateLocationSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(2).max(120).optional(),
    description: zod_1.z.string().min(5).max(1000).optional(),
    panoramaUrl: zod_1.z.string().url().optional(),
    previewUrl: zod_1.z.string().url().optional(),
})
    .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field is required for update",
});
const idParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
async function listLocationsController(_req, res, next) {
    try {
        const locations = await (0, location_service_1.getCampusLocations)();
        res.status(200).json({ locations });
    }
    catch (error) {
        next(error);
    }
}
async function getLocationByIdController(req, res, next) {
    try {
        const params = idParamSchema.parse(req.params);
        const location = await (0, location_service_1.getCampusLocationById)(params.id);
        res.status(200).json({ location });
    }
    catch (error) {
        next(error);
    }
}
async function createLocationController(req, res, next) {
    try {
        const body = createLocationSchema.parse(req.body);
        const location = await (0, location_service_1.createCampusLocationWithPanorama)({
            name: body.name,
            description: body.description,
            panoramaUrl: body.panoramaUrl,
            previewUrl: body.previewUrl,
        });
        res.status(201).json({ location });
    }
    catch (error) {
        next(error);
    }
}
async function updateLocationController(req, res, next) {
    try {
        const params = idParamSchema.parse(req.params);
        const body = updateLocationSchema.parse(req.body);
        const location = await (0, location_service_1.updateCampusLocationById)(params.id, body);
        res.status(200).json({ location });
    }
    catch (error) {
        next(error);
    }
}
async function deleteLocationController(req, res, next) {
    try {
        const params = idParamSchema.parse(req.params);
        await (0, location_service_1.deleteCampusLocationById)(params.id);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
}
