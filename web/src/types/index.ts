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
  workingHours: string | null;
  phone: string | null;
  facilities: string[] | null;
  mapUrl: string | null;
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
}

export interface PanoramaLink {
  id: string;
  fromPanoramaId: string;
  toPanoramaId: string;
  direction: string | null;
  toPanorama?: PanoramaImage;
}

export interface PanoramaImage {
  id: string;
  locationId: string;
  url: string;
  title: string | null;
  sortOrder: number;
  createdAt: string;
  links?: PanoramaLink[];
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
