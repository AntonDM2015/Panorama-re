import { City, Building, Location, Panorama } from '../services/api';

export type RootStackParamList = {
  Cities: undefined;
  Buildings: { city: City };
  Locations: { building: Building };
  Panorama: { location: Location; panoramas: Panorama[] };
};
