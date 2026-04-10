import { LocationRepository } from '../repositories/location.repository';
import { PanoramaRepository } from '../repositories/panorama.repository';
import { PanoramaLinkRepository } from '../repositories/panorama_link.repository';
import { uploadPanoramaFile } from './storage.service';
import { Location } from '../types';

const locationRepo = new LocationRepository();
const panoramaRepo = new PanoramaRepository();
const panoramaLinkRepo = new PanoramaLinkRepository();

export class LocationService {
  async getAllLocations(): Promise<Location[]> {
    return locationRepo.getAll();
  }

  async getLocationsByBuilding(buildingId: string): Promise<Location[]> {
    return locationRepo.getByBuildingId(buildingId);
  }

  async getLocationById(id: string): Promise<Location | null> {
    const location = await locationRepo.getById(id);
    if (!location) return null;

    // Load panoramas for this location
    const panoramas = await panoramaRepo.getByLocationId(id);
    location.panoramas = panoramas;

    // Load navigation links (optional logic can be placed here if needed)
    // Note: Panorama links are now fetched per-panorama or fetched individually when needed.

    return location;
  }

  async createLocation(data: { buildingId: string; name: string; description?: string; floor?: number; type?: 'location' | 'room'; roomNumber?: string; previewUrl?: string; panoramaUrl?: string }): Promise<Location> {
    return locationRepo.create(data);
  }

  async updateLocation(id: string, updates: { name?: string; description?: string; floor?: number; type?: 'location' | 'room'; roomNumber?: string; previewUrl?: string; panoramaUrl?: string }): Promise<Location> {
    return locationRepo.update(id, updates);
  }

  async deleteLocation(id: string): Promise<void> {
    // Delete all panoramas for this location first
    await panoramaRepo.deleteByLocationId(id);
    // Then delete the location
    await locationRepo.delete(id);
  }

  async uploadPanoramaImage(locationId: string, file: Express.Multer.File): Promise<{ url: string }> {
    // Verify location exists
    const location = await locationRepo.getById(locationId);
    if (!location) {
      throw new Error('Location not found');
    }

    // Upload to storage
    const { publicUrl } = await uploadPanoramaFile({
      fileBuffer: file.buffer,
      mimeType: file.mimetype,
      originalFileName: file.originalname,
    });

    // Save panorama record
    await panoramaRepo.create({
      locationId,
      url: publicUrl,
      title: file.originalname,
    });

    return { url: publicUrl };
  }

  // Panorama management
  async getAllPanoramas() {
    return panoramaRepo.getAll();
  }

  async getLocationPanoramas(locationId: string) {
    return panoramaRepo.getByLocationId(locationId);
  }

  async createPanorama(data: { locationId: string; url: string; title?: string; sortOrder?: number }) {
    return panoramaRepo.create(data);
  }

  async updatePanorama(id: string, updates: { url?: string; title?: string; sortOrder?: number }) {
    return panoramaRepo.update(id, updates);
  }

  async deletePanorama(id: string): Promise<void> {
    return panoramaRepo.delete(id);
  }

  // Panorama links management
  async getPanoramaLinks(panoramaId: string) {
    return panoramaLinkRepo.getByPanoramaId(panoramaId);
  }

  async createPanoramaLink(data: { fromPanoramaId: string; toPanoramaId: string; direction?: string }) {
    return panoramaLinkRepo.create(data);
  }

  async deletePanoramaLink(id: string): Promise<void> {
    return panoramaLinkRepo.delete(id);
  }
}
