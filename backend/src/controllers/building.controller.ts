import { Request, Response, NextFunction } from 'express';
import { BuildingService } from '../services/building.service';

const buildingService = new BuildingService();

export class BuildingController {
  // GET /api/buildings
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const buildings = await buildingService.getAllBuildings();
      res.json({ buildings });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/cities/:cityId/buildings
  getByCity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const buildings = await buildingService.getBuildingsByCity(req.params.cityId);
      res.json({ buildings });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/buildings/:id
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const building = await buildingService.getBuildingById(req.params.id);
      if (!building) {
        return res.status(404).json({ message: 'Корпус не найден' });
      }
      res.json({ building });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/buildings (admin only)
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cityId, name, address, description, previewUrl } = req.body;
      if (!cityId || !name) {
        return res.status(400).json({ message: 'cityId и name обязательны' });
      }
      const building = await buildingService.createBuilding({
        cityId,
        name,
        address,
        description,
        previewUrl,
      });
      res.status(201).json({ building });
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/buildings/:id (admin only)
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, address, description, previewUrl } = req.body;
      const building = await buildingService.updateBuilding(req.params.id, {
        name,
        address,
        description,
        previewUrl,
      });
      res.json({ building });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/buildings/:id (admin only)
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await buildingService.deleteBuilding(req.params.id);
      res.json({ message: 'Корпус удалён' });
    } catch (error) {
      next(error);
    }
  };
}
