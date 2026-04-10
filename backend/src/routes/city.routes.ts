import { Router } from 'express';
import { CityController } from '../controllers/city.controller';
import { BuildingController } from '../controllers/building.controller';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';

const router = Router();
const cityController = new CityController();
const buildingController = new BuildingController();

// Public routes
router.get('/', cityController.getAll);
router.get('/:id', cityController.getById);

// Nested routes - buildings by city
router.get('/:cityId/buildings', buildingController.getByCity);

// Admin routes
router.post('/', requireAuth, requireAdmin, cityController.create);
router.put('/:id', requireAuth, requireAdmin, cityController.update);
router.delete('/:id', requireAuth, requireAdmin, cityController.delete);

export default router;
