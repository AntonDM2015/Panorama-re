import { Router } from 'express';
import { LocationController } from '../controllers/location.controller';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';

const router = Router();
const locationController = new LocationController();

// Public routes
router.get('/', locationController.getAll.bind(locationController));
router.get('/:id', locationController.getById.bind(locationController));

// Panorama routes
router.get('/:locationId/panoramas', locationController.getPanoramas.bind(locationController));

// Admin routes
router.post('/', requireAuth, requireAdmin, locationController.create.bind(locationController));
router.put('/:id', requireAuth, requireAdmin, locationController.update.bind(locationController));
router.delete('/:id', requireAuth, requireAdmin, locationController.delete.bind(locationController));

// Panorama admin routes
router.post('/:locationId/panoramas', requireAuth, requireAdmin, locationController.createPanorama.bind(locationController));
router.put('/panoramas/:id', requireAuth, requireAdmin, locationController.updatePanorama.bind(locationController));
router.delete('/panoramas/:id', requireAuth, requireAdmin, locationController.deletePanorama.bind(locationController));

// Navigation links routes
router.get('/:locationId/navigation-links', locationController.getNavigationLinks.bind(locationController));
router.post('/:locationId/navigation-links', requireAuth, requireAdmin, locationController.createNavigationLink.bind(locationController));
router.delete('/navigation-links/:id', requireAuth, requireAdmin, locationController.deleteNavigationLink.bind(locationController));

export default router;
