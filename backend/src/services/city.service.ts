import { CityRepository } from '../repositories/city.repository';
import { City } from '../types';

const cityRepo = new CityRepository();

export class CityService {
  async getAllCities(): Promise<City[]> {
    return cityRepo.getAll();
  }

  async getCityById(id: string): Promise<City | null> {
    return cityRepo.getById(id);
  }

  async createCity(name: string, country: string = 'Россия'): Promise<City> {
    return cityRepo.create(name, country);
  }

  async updateCity(id: string, updates: { name?: string; country?: string }): Promise<City> {
    return cityRepo.update(id, updates);
  }

  async deleteCity(id: string): Promise<void> {
    return cityRepo.delete(id);
  }
}
