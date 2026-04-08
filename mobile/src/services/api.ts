import AsyncStorage from "@react-native-async-storage/async-storage";
import { CampusLocation } from "../types/navigation";

type ApiLocationItem = {
  id: string;
  name: string;
  description: string;
  panoramaUrl: string;
  previewUrl: string;
  createdAt: string;
};

type LocationsApiResponse = {
  locations: ApiLocationItem[];
};

type AuthResponse = {
  user: {
    id: string;
    email: string;
    role: "student" | "admin";
    createdAt: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
};

type MeResponse = {
  user: {
    userId: string;
    email: string;
    role: "student" | "admin";
  };
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() ?? "";

const LOCATIONS_CACHE_KEY = "@campus_panorama_locations_cache";
const LOCATIONS_CACHE_TIMESTAMP_KEY = "@campus_panorama_locations_cache_timestamp";
const CACHE_DURATION_MS = 5 * 60 * 1000;

function assertApiBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_BASE_URL is not set");
  }

  return API_BASE_URL;
}

function mapApiLocationToCampusLocation(apiLocation: ApiLocationItem): CampusLocation {
  return {
    id: apiLocation.id,
    title: apiLocation.name,
    description: apiLocation.description,
    panoramaUrl: apiLocation.panoramaUrl,
    previewSource: apiLocation.previewUrl,
  };
}

async function getAccessToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem("@campus_panorama_access_token");
  } catch (error) {
    console.error("Failed to get access token:", error);
    return null;
  }
}

async function saveTokens(accessToken: string, refreshToken: string): Promise<void> {
  try {
    await AsyncStorage.setItem("@campus_panorama_access_token", accessToken);
    await AsyncStorage.setItem("@campus_panorama_refresh_token", refreshToken);
  } catch (error) {
    console.error("Failed to save tokens:", error);
    throw error;
  }
}

async function clearTokens(): Promise<void> {
  try {
    await AsyncStorage.removeItem("@campus_panorama_access_token");
    await AsyncStorage.removeItem("@campus_panorama_refresh_token");
  } catch (error) {
    console.error("Failed to clear tokens:", error);
    throw error;
  }
}

export function getApiBaseUrl(): string {
  return assertApiBaseUrl();
}

export async function fetchLocationsFromApi(forceRefresh = false): Promise<CampusLocation[]> {
  if (!forceRefresh) {
    try {
      const cachedData = await AsyncStorage.getItem(LOCATIONS_CACHE_KEY);
      const cachedTimestamp = await AsyncStorage.getItem(LOCATIONS_CACHE_TIMESTAMP_KEY);

      if (cachedData && cachedTimestamp) {
        const age = Date.now() - parseInt(cachedTimestamp, 10);
        if (age < CACHE_DURATION_MS) {
          const parsed = JSON.parse(cachedData) as CampusLocation[];
          return parsed;
        }
      }
    } catch (error) {
      console.warn("Failed to read cache, fetching from API:", error);
    }
  }

  const response = await fetch(`${assertApiBaseUrl()}/api/locations`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load locations: ${response.status}`);
  }

  const data = (await response.json()) as LocationsApiResponse;

  if (!Array.isArray(data.locations)) {
    throw new Error("Invalid API response for locations");
  }

  const locations = data.locations.map(mapApiLocationToCampusLocation);

  try {
    await AsyncStorage.setItem(LOCATIONS_CACHE_KEY, JSON.stringify(locations));
    await AsyncStorage.setItem(LOCATIONS_CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.warn("Failed to cache locations:", error);
  }

  return locations;
}

export async function fetchLocationById(locationId: string): Promise<CampusLocation> {
  const response = await fetch(`${assertApiBaseUrl()}/api/locations/${locationId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load location: ${response.status}`);
  }

  const data = (await response.json()) as { location: ApiLocationItem };

  return mapApiLocationToCampusLocation(data.location);
}

export async function loginWithEmailPassword(
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await fetch(`${assertApiBaseUrl()}/api/auth/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(errorData.message || `Login failed: ${response.status}`);
  }

  const data = (await response.json()) as AuthResponse;

  await saveTokens(data.tokens.accessToken, data.tokens.refreshToken);

  return data;
}

export async function registerWithEmailPassword(
  email: string,
  password: string,
  role?: "student" | "admin"
): Promise<AuthResponse> {
  const response = await fetch(`${assertApiBaseUrl()}/api/auth/register`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, role }),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(errorData.message || `Registration failed: ${response.status}`);
  }

  const data = (await response.json()) as AuthResponse;

  await saveTokens(data.tokens.accessToken, data.tokens.refreshToken);

  return data;
}

export async function getCurrentUser(): Promise<MeResponse | null> {
  const token = await getAccessToken();

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${assertApiBaseUrl()}/api/auth/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as MeResponse;
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  await clearTokens();
}
