import { BuildingRepository } from '../repositories/building.repository';
import { Building } from '../types';

const buildingRepo = new BuildingRepository();

export class BuildingService {
  async getAllBuildings(): Promise<Building[]> {
    return buildingRepo.getAll();
  }

  async getBuildingsByCity(cityId: string): Promise<Building[]> {
    return buildingRepo.getByCityId(cityId);
  }

  async getBuildingById(id: string): Promise<Building | null> {
    return buildingRepo.getById(id);
  }

  async createBuilding(data: { cityId: string; name: string; address?: string; description?: string; previewUrl?: string }): Promise<Building> {
    return buildingRepo.create(data);
  }

  async updateBuilding(id: string, updates: { name?: string; address?: string; description?: string; previewUrl?: string }): Promise<Building> {
    return buildingRepo.update(id, updates);
  }

  async deleteBuilding(id: string): Promise<void> {
    return buildingRepo.delete(id);
  }
}
