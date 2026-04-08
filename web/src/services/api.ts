import axios from 'axios';
import { City, Building, Location, PanoramaImage, NavigationLink } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    console.log('[API] Adding auth token to request:', config.url);
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('[API] No auth token found for request:', config.url);
  }
  return config;
});

// ==================== CITIES ====================

export const getCities = async (): Promise<City[]> => {
  try {
    const response = await api.get('/api/cities');
    return response.data.cities || [];
  } catch (error) {
    console.error('[API] Error fetching cities:', error);
    throw error;
  }
};

export const getCityById = async (id: string): Promise<City> => {
  try {
    const response = await api.get(`/api/cities/${id}`);
    return response.data.city;
  } catch (error) {
    console.error(`[API] Error fetching city ${id}:`, error);
    throw error;
  }
};

export const createCity = async (data: { name: string; country?: string }): Promise<City> => {
  try {
    const response = await api.post('/api/cities', data);
    return response.data.city;
  } catch (error) {
    console.error('[API] Error creating city:', error);
    throw error;
  }
};

export const updateCity = async (id: string, data: { name?: string; country?: string }): Promise<City> => {
  try {
    const response = await api.put(`/api/cities/${id}`, data);
    return response.data.city;
  } catch (error) {
    console.error(`[API] Error updating city ${id}:`, error);
    throw error;
  }
};

export const deleteCity = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/cities/${id}`);
  } catch (error) {
    console.error(`[API] Error deleting city ${id}:`, error);
    throw error;
  }
};

// ==================== BUILDINGS ====================

export const getBuildings = async (): Promise<Building[]> => {
  try {
    const response = await api.get('/api/buildings');
    return response.data.buildings || [];
  } catch (error) {
    console.error('[API] Error fetching buildings:', error);
    throw error;
  }
};

export const getBuildingsByCity = async (cityId: string): Promise<Building[]> => {
  try {
    const response = await api.get(`/api/cities/${cityId}/buildings`);
    return response.data.buildings || [];
  } catch (error) {
    console.error(`[API] Error fetching buildings for city ${cityId}:`, error);
    throw error;
  }
};

export const getBuildingById = async (id: string): Promise<Building> => {
  try {
    const response = await api.get(`/api/buildings/${id}`);
    return response.data.building;
  } catch (error) {
    console.error(`[API] Error fetching building ${id}:`, error);
    throw error;
  }
};

export const createBuilding = async (data: { 
  cityId: string; 
  name: string; 
  address?: string; 
  description?: string; 
  previewUrl?: string;
}): Promise<Building> => {
  try {
    const response = await api.post('/api/buildings', data);
    return response.data.building;
  } catch (error) {
    console.error('[API] Error creating building:', error);
    throw error;
  }
};

export const updateBuilding = async (id: string, data: { 
  name?: string; 
  address?: string; 
  description?: string; 
  previewUrl?: string;
}): Promise<Building> => {
  try {
    const response = await api.put(`/api/buildings/${id}`, data);
    return response.data.building;
  } catch (error) {
    console.error(`[API] Error updating building ${id}:`, error);
    throw error;
  }
};

export const deleteBuilding = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/buildings/${id}`);
  } catch (error) {
    console.error(`[API] Error deleting building ${id}:`, error);
    throw error;
  }
};

// ==================== LOCATIONS ====================

export const getLocations = async (): Promise<Location[]> => {
  try {
    const response = await api.get('/api/locations');
    return response.data.locations || [];
  } catch (error) {
    console.error('[API] Error fetching locations:', error);
    throw error;
  }
};

export const getLocationsByBuilding = async (buildingId: string): Promise<Location[]> => {
  try {
    const response = await api.get(`/api/buildings/${buildingId}/locations`);
    return response.data.locations || [];
  } catch (error) {
    console.error(`[API] Error fetching locations for building ${buildingId}:`, error);
    throw error;
  }
};

export const getLocationById = async (id: string): Promise<Location> => {
  try {
    const response = await api.get(`/api/locations/${id}`);
    return response.data.location;
  } catch (error) {
    console.error(`[API] Error fetching location ${id}:`, error);
    throw error;
  }
};

export const createLocation = async (data: {
  buildingId: string;
  name: string;
  description?: string;
  floor?: number;
  type?: 'location' | 'room';
  roomNumber?: string;
  previewUrl?: string;
  panoramaUrl?: string;
}): Promise<Location> => {
  try {
    const response = await api.post('/api/locations', data);
    return response.data.location;
  } catch (error) {
    console.error('[API] Error creating location:', error);
    throw error;
  }
};

export const updateLocation = async (id: string, data: {
  name?: string;
  description?: string;
  floor?: number;
  type?: 'location' | 'room';
  roomNumber?: string;
  previewUrl?: string;
  panoramaUrl?: string;
}): Promise<Location> => {
  try {
    const response = await api.put(`/api/locations/${id}`, data);
    return response.data.location;
  } catch (error) {
    console.error(`[API] Error updating location ${id}:`, error);
    throw error;
  }
};

export const deleteLocation = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/locations/${id}`);
  } catch (error) {
    console.error(`[API] Error deleting location ${id}:`, error);
    throw error;
  }
};

// ==================== PANORAMAS ====================

export const getPanoramasByLocation = async (locationId: string): Promise<PanoramaImage[]> => {
  try {
    const response = await api.get(`/api/locations/${locationId}/panoramas`);
    return response.data.panoramas || [];
  } catch (error) {
    console.error(`[API] Error fetching panoramas for location ${locationId}:`, error);
    throw error;
  }
};

export const createPanorama = async (locationId: string, data: {
  url: string;
  title?: string;
  sortOrder?: number;
}): Promise<PanoramaImage> => {
  try {
    const response = await api.post(`/api/locations/${locationId}/panoramas`, data);
    return response.data.panorama;
  } catch (error) {
    console.error(`[API] Error creating panorama for location ${locationId}:`, error);
    throw error;
  }
};

export const updatePanorama = async (id: string, data: {
  url?: string;
  title?: string;
  sortOrder?: number;
}): Promise<PanoramaImage> => {
  try {
    const response = await api.put(`/api/panoramas/${id}`, data);
    return response.data.panorama;
  } catch (error) {
    console.error(`[API] Error updating panorama ${id}:`, error);
    throw error;
  }
};

export const deletePanorama = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/panoramas/${id}`);
  } catch (error) {
    console.error(`[API] Error deleting panorama ${id}:`, error);
    throw error;
  }
};

// ==================== AUTH ====================

export const login = async (email: string, password: string): Promise<{ token: string; user: any }> => {
  try {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('[API] Error logging in:', error);
    throw error;
  }
};

export const logout = (): void => {
  localStorage.removeItem('auth_token');
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// ==================== NAVIGATION LINKS ====================

export const getNavigationLinks = async (locationId: string): Promise<NavigationLink[]> => {
  try {
    const response = await api.get(`/api/locations/${locationId}/navigation-links`);
    return response.data.links || response.data.navigationLinks || [];
  } catch (error) {
    console.error(`[API] Error fetching navigation links for location ${locationId}:`, error);
    throw error;
  }
};

export const createNavigationLink = async (locationId: string, data: {
  toLocationId: string;
  direction?: string;
}): Promise<NavigationLink> => {
  try {
    const response = await api.post(`/api/locations/${locationId}/navigation-links`, data);
    return response.data.link;
  } catch (error) {
    console.error(`[API] Error creating navigation link:`, error);
    throw error;
  }
};

export const deleteNavigationLink = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/navigation-links/${id}`);
  } catch (error) {
    console.error(`[API] Error deleting navigation link:`, error);
    throw error;
  }
};
