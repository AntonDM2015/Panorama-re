import { Router } from 'express';
import { BuildingController } from '../controllers/building.controller';
import { LocationController } from '../controllers/location.controller';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';

const router = Router();
const buildingController = new BuildingController();
const locationController = new LocationController();

// Public routes
router.get('/', buildingController.getAll);
router.get('/:id', buildingController.getById);

// Nested routes - locations by building
router.get('/:buildingId/locations', locationController.getByBuilding);

// Admin routes
router.post('/', requireAuth, requireAdmin, buildingController.create);
router.put('/:id', requireAuth, requireAdmin, buildingController.update);
router.delete('/:id', requireAuth, requireAdmin, buildingController.delete);

export default router;
