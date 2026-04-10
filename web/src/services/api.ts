import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { City, Building, Location, PanoramaImage, PanoramaLink } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Refresh access token using refresh token
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.error('[API] No refresh token available');
      return null;
    }

    console.log('[API] Refreshing access token...');
    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
      refreshToken
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data.tokens;
    
    // Save both tokens
    localStorage.setItem('accessToken', accessToken);
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }

    console.log('[API] Access token refreshed successfully');
    return accessToken;
  } catch (error) {
    console.error('[API] Failed to refresh token:', error);
    // Clear tokens on refresh failure
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return null;
  }
};

// Add auth token to requests if available
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        
        if (newToken) {
          // Process queued requests
          processQueue(null, newToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          // Refresh failed, redirect to login
          processQueue(error, null);
          console.error('[API] Token refresh failed, redirecting to login');
          window.location.href = '/admin';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        console.error('[API] Token refresh error, redirecting to login');
        window.location.href = '/admin';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

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
  workingHours?: string;
  phone?: string;
  facilities?: string[];
  mapUrl?: string;
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
  workingHours?: string;
  phone?: string;
  facilities?: string[];
  mapUrl?: string;
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
    const response = await api.put(`/api/locations/panoramas/${id}`, data);
    return response.data.panorama;
  } catch (error) {
    console.error(`[API] Error updating panorama ${id}:`, error);
    throw error;
  }
};

export const deletePanorama = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/locations/panoramas/${id}`);
  } catch (error) {
    console.error(`[API] Error deleting panorama ${id}:`, error);
    throw error;
  }
};

export const getAllPanoramas = async (): Promise<PanoramaImage[]> => {
  try {
    const response = await api.get('/api/locations/panoramas');
    return response.data.panoramas || [];
  } catch (error) {
    console.error('[API] Error fetching all panoramas:', error);
    throw error;
  }
};

// ==================== AUTH ====================

export const login = async (email: string, password: string): Promise<{ tokens: { accessToken: string; refreshToken: string }; user: any }> => {
  try {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('[API] Error logging in:', error);
    throw error;
  }
};

export const logout = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('accessToken');
};

// ==================== PANORAMA LINKS ====================

export const getPanoramaLinks = async (panoramaId: string): Promise<PanoramaLink[]> => {
  try {
    const response = await api.get(`/api/locations/panoramas/${panoramaId}/links`);
    return response.data.links || [];
  } catch (error) {
    console.error(`[API] Error fetching panorama links for ${panoramaId}:`, error);
    throw error;
  }
};

export const createPanoramaLink = async (panoramaId: string, data: {
  toPanoramaId: string;
  direction?: string;
}): Promise<PanoramaLink> => {
  try {
    const response = await api.post(`/api/locations/panoramas/${panoramaId}/links`, data);
    return response.data.link;
  } catch (error) {
    console.error(`[API] Error creating panorama link:`, error);
    throw error;
  }
};

export const deletePanoramaLink = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/locations/panorama-links/${id}`);
  } catch (error) {
    console.error(`[API] Error deleting panorama link:`, error);
    throw error;
  }
};
