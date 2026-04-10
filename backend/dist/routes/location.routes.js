"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const location_controller_1 = require("../controllers/location.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const locationController = new location_controller_1.LocationController();
// Global Panorama route
router.get('/panoramas', locationController.getAllPanoramas);
// Public routes
router.get('/', locationController.getAll);
router.get('/:id', locationController.getById);
// Panorama routes
router.get('/:locationId/panoramas', locationController.getPanoramas);
// Admin routes
router.post('/', auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, locationController.create);
router.put('/:id', auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, locationController.update);
router.delete('/:id', auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, locationController.delete);
// Panorama admin routes
router.post('/:locationId/panoramas', auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, locationController.createPanorama);
router.put('/panoramas/:id', auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, locationController.updatePanorama);
router.delete('/panoramas/:id', auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, locationController.deletePanorama);
// Panorama links routes
router.get('/panoramas/:panoramaId/links', locationController.getPanoramaLinks);
router.post('/panoramas/:panoramaId/links', auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, locationController.createPanoramaLink);
router.delete('/panorama-links/:id', auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, locationController.deletePanoramaLink);
exports.default = router;
