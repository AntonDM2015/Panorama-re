import { Router } from 'express';
import { BuildingController } from '../controllers/building.controller';
import { LocationController } from '../controllers/location.controller';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';

const router = Router();
const buildingController = new BuildingController();
const locationController = new LocationController();

// Public routes
router.get('/', buildingController.getAll.bind(buildingController));
router.get('/:id', buildingController.getById.bind(buildingController));

// Nested routes - locations by building
router.get('/:buildingId/locations', locationController.getByBuilding.bind(locationController));

// Admin routes
router.post('/', requireAuth, requireAdmin, buildingController.create.bind(buildingController));
router.put('/:id', requireAuth, requireAdmin, buildingController.update.bind(buildingController));
router.delete('/:id', requireAuth, requireAdmin, buildingController.delete.bind(buildingController));

export default router;
