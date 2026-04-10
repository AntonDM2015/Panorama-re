import { Router } from 'express';
import { LocationController } from '../controllers/location.controller';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';

const router = Router();
const locationController = new LocationController();

// Global Panorama route
router.get('/panoramas', locationController.getAllPanoramas);

// Public routes
router.get('/', locationController.getAll);
router.get('/:id', locationController.getById);

// Panorama routes
router.get('/:locationId/panoramas', locationController.getPanoramas);

// Admin routes
router.post('/', requireAuth, requireAdmin, locationController.create);
router.put('/:id', requireAuth, requireAdmin, locationController.update);
router.delete('/:id', requireAuth, requireAdmin, locationController.delete);

// Panorama admin routes
router.post('/:locationId/panoramas', requireAuth, requireAdmin, locationController.createPanorama);
router.put('/panoramas/:id', requireAuth, requireAdmin, locationController.updatePanorama);
router.delete('/panoramas/:id', requireAuth, requireAdmin, locationController.deletePanorama);

// Panorama links routes
router.get('/panoramas/:panoramaId/links', locationController.getPanoramaLinks);
router.post('/panoramas/:panoramaId/links', requireAuth, requireAdmin, locationController.createPanoramaLink);
router.delete('/panorama-links/:id', requireAuth, requireAdmin, locationController.deletePanoramaLink);

export default router;
