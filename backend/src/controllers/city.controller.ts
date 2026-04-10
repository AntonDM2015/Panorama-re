import { Request, Response, NextFunction } from 'express';
import { CityService } from '../services/city.service';

const cityService = new CityService();

export class CityController {
  // GET /api/cities
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cities = await cityService.getAllCities();
      res.json({ cities });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/cities/:id
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const city = await cityService.getCityById(req.params.id);
      if (!city) {
        return res.status(404).json({ message: 'Город не найден' });
      }
      res.json({ city });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/cities (admin only)
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, country } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'Название города обязательно' });
      }
      const city = await cityService.createCity(name, country || 'Россия');
      res.status(201).json({ city });
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/cities/:id (admin only)
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, country } = req.body;
      const city = await cityService.updateCity(req.params.id, { name, country });
      res.json({ city });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/cities/:id (admin only)
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await cityService.deleteCity(req.params.id);
      res.json({ message: 'Город удалён' });
    } catch (error) {
      next(error);
    }
  };
}
