import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

// ==================== TYPES ====================

export type City = {
  id: string;
  name: string;
  country?: string;
  createdAt: string;
};

export type Building = {
  id: string;
  cityId: string;
  name: string;
  address?: string;
  description?: string;
  previewUrl?: string;
  createdAt: string;
};

export type Panorama = {
  id: string;
  locationId: string;
  url: string;
  title?: string;
  sortOrder: number;
  createdAt: string;
};

export type Location = {
  id: string;
  buildingId: string;
  name: string;
  description?: string;
  floor?: number;
  type: "location" | "room";
  roomNumber?: string;
  previewUrl?: string;
  panoramas?: Panorama[];
  createdAt: string;
};

// ==================== API CONFIG ====================

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() ?? "";

function assertApiBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_BASE_URL is not set");
  }
  return API_BASE_URL;
}

// ==================== CACHE CONFIG ====================

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

async function getFromCache<T>(key: string): Promise<T | null> {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    const age = Date.now() - entry.timestamp;

    if (age < CACHE_TTL_MS) {
      return entry.data;
    }

    // Cache expired
    await AsyncStorage.removeItem(key);
    return null;
  } catch (error) {
    console.error(`[Cache] Failed to read ${key}:`, error);
    return null;
  }
}

async function setCache<T>(key: string, data: T): Promise<void> {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    console.error(`[Cache] Failed to write ${key}:`, error);
  }
}

// ==================== API FUNCTIONS ====================

// CITIES
export async function getCities(forceRefresh = false): Promise<City[]> {
  const cacheKey = "@panorama_cache_cities";

  // Try cache first
  if (!forceRefresh) {
    const cached = await getFromCache<City[]>(cacheKey);
    if (cached) {
      console.log('[API] Cities loaded from cache');
      return cached;
    }
  }

  // Fetch from API
  console.log('[API] Fetching cities from API');
  const response = await fetch(`${assertApiBaseUrl()}/api/cities`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch cities: ${response.status}`);
  }

  const data = await response.json();
  const cities: City[] = data.cities || [];

  // Cache result
  await setCache(cacheKey, cities);
  return cities;
}

export async function getCityById(id: string): Promise<City> {
  const response = await fetch(`${assertApiBaseUrl()}/api/cities/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch city: ${response.status}`);
  }

  const data = await response.json();
  return data.city;
}

// BUILDINGS
export async function getBuildingsByCity(cityId: string, forceRefresh = false): Promise<Building[]> {
  const cacheKey = `@panorama_cache_buildings_${cityId}`;

  // Try cache first
  if (!forceRefresh) {
    const cached = await getFromCache<Building[]>(cacheKey);
    if (cached) {
      console.log(`[API] Buildings for city ${cityId} loaded from cache`);
      return cached;
    }
  }

  // Fetch from API
  console.log(`[API] Fetching buildings for city ${cityId}`);
  const response = await fetch(`${assertApiBaseUrl()}/api/cities/${cityId}/buildings`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch buildings: ${response.status}`);
  }

  const data = await response.json();
  const buildings: Building[] = data.buildings || [];

  // Cache result
  await setCache(cacheKey, buildings);
  return buildings;
}

export async function getBuildingById(id: string): Promise<Building> {
  const response = await fetch(`${assertApiBaseUrl()}/api/buildings/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch building: ${response.status}`);
  }

  const data = await response.json();
  return data.building;
}

// LOCATIONS
export async function getLocationsByBuilding(buildingId: string, forceRefresh = false): Promise<Location[]> {
  const cacheKey = `@panorama_cache_locations_${buildingId}`;

  // Try cache first
  if (!forceRefresh) {
    const cached = await getFromCache<Location[]>(cacheKey);
    if (cached) {
      console.log(`[API] Locations for building ${buildingId} loaded from cache`);
      return cached;
    }
  }

  // Fetch from API
  console.log(`[API] Fetching locations for building ${buildingId}`);
  const response = await fetch(`${assertApiBaseUrl()}/api/buildings/${buildingId}/locations`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch locations: ${response.status}`);
  }

  const data = await response.json();
  const locations: Location[] = data.locations || [];

  // Cache result
  await setCache(cacheKey, locations);
  return locations;
}

export async function getLocationById(id: string): Promise<Location> {
  const response = await fetch(`${assertApiBaseUrl()}/api/locations/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch location: ${response.status}`);
  }

  const data = await response.json();
  return data.location;
}

// PANORAMAS
export async function getPanoramasByLocation(locationId: string, forceRefresh = false): Promise<Panorama[]> {
  const cacheKey = `@panorama_cache_panoramas_${locationId}`;

  // Try cache first
  if (!forceRefresh) {
    const cached = await getFromCache<Panorama[]>(cacheKey);
    if (cached) {
      console.log(`[API] Panoramas for location ${locationId} loaded from cache`);
      return cached;
    }
  }

  // Fetch from API
  console.log(`[API] Fetching panoramas for location ${locationId}`);
  const response = await fetch(`${assertApiBaseUrl()}/api/locations/${locationId}/panoramas`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch panoramas: ${response.status}`);
  }

  const data = await response.json();
  const panoramas: Panorama[] = data.panoramas || [];

  // Cache result
  await setCache(cacheKey, panoramas);
  return panoramas;
}

// ==================== NETWORK & OFFLINE HELPERS ====================

export async function checkInternetConnection(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
}

export async function fetchWithOfflineFallback<T>(
  fetchFn: () => Promise<T>,
  cacheKey: string
): Promise<{ data: T; isOffline: boolean }> {
  const isConnected = await checkInternetConnection();

  if (isConnected) {
    try {
      const data = await fetchFn();
      return { data, isOffline: false };
    } catch (error) {
      console.error('[API] Online fetch failed, trying cache:', error);
      // Fall back to cache
    }
  }

  // Try cache
  const cached = await getFromCache<T>(cacheKey);
  if (cached) {
    console.log('[API] Using cached data (offline or error)');
    return { data: cached, isOffline: true };
  }

  throw new Error('Нет подключения к интернету и данные не найдены в кэше');
}

// ==================== CLEAR CACHE ====================

export async function clearAllCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const panoramaKeys = keys.filter(key => key.startsWith('@panorama_cache_'));
    await AsyncStorage.multiRemove(panoramaKeys);
    console.log('[Cache] All cache cleared');
  } catch (error) {
    console.error('[Cache] Failed to clear cache:', error);
  }
}
