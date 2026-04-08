import { Router } from 'express';
import { CityController } from '../controllers/city.controller';
import { BuildingController } from '../controllers/building.controller';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';

const router = Router();
const cityController = new CityController();
const buildingController = new BuildingController();

// Public routes
router.get('/', cityController.getAll.bind(cityController));
router.get('/:id', cityController.getById.bind(cityController));

// Nested routes - buildings by city
router.get('/:cityId/buildings', buildingController.getByCity.bind(buildingController));

// Admin routes
router.post('/', requireAuth, requireAdmin, cityController.create.bind(cityController));
router.put('/:id', requireAuth, requireAdmin, cityController.update.bind(cityController));
router.delete('/:id', requireAuth, requireAdmin, cityController.delete.bind(cityController));

export default router;
