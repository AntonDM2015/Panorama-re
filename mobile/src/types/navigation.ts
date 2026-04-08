export type NavigationHotspot = {
  id: string;
  pitch: number;
  yaw: number;
  text: string;
  targetLocationId?: string;
  targetPanoramaIndex?: number;
};

export type PanoramaImage = {
  id: string;
  url: string;
  title: string;
  hotspots?: NavigationHotspot[];
};

export type NavigationLink = {
  targetLocationId: string;
  targetPanoramaIndex?: number;
  direction: "forward" | "backward" | "left" | "right" | "up" | "down";
  label?: string;
};

export type CampusLocation = {
  id: string;
  title: string;
  description: string;
  floor?: number;
  category: "common" | "room";
  panoramas: PanoramaImage[];
  connections?: NavigationLink[];
};

export type CampusFloor = {
  floorNumber: number;
  locations: CampusLocation[];
};

export type RootStackParamList = {
  Locations: undefined;
  Panorama: {
    locationId: string;
    location?: CampusLocation;
    initialPanoramaIndex?: number;
  };
  FreeNavigation: {
    startLocationId?: string;
    startPanoramaIndex?: number;
  };
};
