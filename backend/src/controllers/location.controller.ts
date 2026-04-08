import { Request, Response, NextFunction } from 'express';
import { LocationService } from '../services/location.service';

const locationService = new LocationService();

export class LocationController {
  // GET /api/locations
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const locations = await locationService.getAllLocations();
      res.json({ locations });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/buildings/:buildingId/locations
  async getByBuilding(req: Request, res: Response, next: NextFunction) {
    try {
      const locations = await locationService.getLocationsByBuilding(req.params.buildingId);
      res.json({ locations });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/locations/:id
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const location = await locationService.getLocationById(req.params.id);
      if (!location) {
        return res.status(404).json({ message: 'Локация не найдена' });
      }
      res.json({ location });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/locations (admin only)
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { buildingId, name, description, floor, type, roomNumber, previewUrl, panoramaUrl } = req.body;
      if (!buildingId || !name) {
        return res.status(400).json({ message: 'buildingId и name обязательны' });
      }
      const location = await locationService.createLocation({
        buildingId,
        name,
        description,
        floor,
        type,
        roomNumber,
        previewUrl,
        panoramaUrl,
      });
      res.status(201).json({ location });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/locations/:id (admin only)
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, floor, type, roomNumber, previewUrl, panoramaUrl } = req.body;
      const location = await locationService.updateLocation(req.params.id, {
        name,
        description,
        floor,
        type,
        roomNumber,
        previewUrl,
        panoramaUrl,
      });
      res.json({ location });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/locations/:id (admin only)
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await locationService.deleteLocation(req.params.id);
      res.json({ message: 'Локация удалена' });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/locations/:locationId/panoramas
  async getPanoramas(req: Request, res: Response, next: NextFunction) {
    try {
      const panoramas = await locationService.getLocationPanoramas(req.params.locationId);
      res.json({ panoramas });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/locations/:locationId/panoramas (admin only)
  async createPanorama(req: Request, res: Response, next: NextFunction) {
    try {
      const { url, title, sortOrder } = req.body;
      if (!url) {
        return res.status(400).json({ message: 'URL панорамы обязателен' });
      }
      const panorama = await locationService.createPanorama({
        locationId: req.params.locationId,
        url,
        title,
        sortOrder,
      });
      res.status(201).json({ panorama });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/panoramas/:id (admin only)
  async updatePanorama(req: Request, res: Response, next: NextFunction) {
    try {
      const { url, title, sortOrder } = req.body;
      const panorama = await locationService.updatePanorama(req.params.id, {
        url,
        title,
        sortOrder,
      });
      res.json({ panorama });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/panoramas/:id (admin only)
  async deletePanorama(req: Request, res: Response, next: NextFunction) {
    try {
      await locationService.deletePanorama(req.params.id);
      res.json({ message: 'Панорама удалена' });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/locations/:locationId/navigation-links
  async getNavigationLinks(req: Request, res: Response, next: NextFunction) {
    try {
      const links = await locationService.getLocationNavigationLinks(req.params.locationId);
      res.json({ links });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/locations/:locationId/navigation-links (admin only)
  async createNavigationLink(req: Request, res: Response, next: NextFunction) {
    try {
      const { toLocationId, direction } = req.body;
      if (!toLocationId) {
        return res.status(400).json({ message: 'toLocationId обязателен' });
      }
      const link = await locationService.createNavigationLink({
        fromLocationId: req.params.locationId,
        toLocationId,
        direction,
      });
      res.status(201).json({ link });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/navigation-links/:id (admin only)
  async deleteNavigationLink(req: Request, res: Response, next: NextFunction) {
    try {
      await locationService.deleteNavigationLink(req.params.id);
      res.json({ message: 'Связь удалена' });
    } catch (error) {
      next(error);
    }
  }
}
