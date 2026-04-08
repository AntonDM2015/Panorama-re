export interface User {
  id: string;
  email: string;
  role: 'student' | 'admin';
}

export interface City {
  id: string;
  name: string;
  country: string;
  createdAt: string;
}

export interface Building {
  id: string;
  cityId: string;
  name: string;
  address: string | null;
  description: string | null;
  previewUrl: string | null;
  createdAt: string;
}

export interface Location {
  id: string;
  buildingId: string;
  name: string;
  description: string | null;
  floor: number | null;
  type: 'location' | 'room';
  roomNumber: string | null;
  previewUrl: string | null;
  panoramaUrl: string | null;
  createdAt: string;
  panoramas?: PanoramaImage[];
  navigationLinks?: NavigationLink[];
}

export interface NavigationLink {
  id: string;
  fromLocationId: string;
  toLocationId: string;
  direction: string | null;
  createdAt: string;
  toLocation?: Location;
}

export interface PanoramaImage {
  id: string;
  locationId: string;
  url: string;
  title: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
