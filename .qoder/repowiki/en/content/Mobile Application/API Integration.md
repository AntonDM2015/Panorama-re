# API Integration

<cite>
**Referenced Files in This Document**
- [api.ts](file://mobile/src/services/api.ts)
- [navigation.ts](file://mobile/src/types/navigation.ts)
- [useLocations.ts](file://mobile/src/hooks/useLocations.ts)
- [AppNavigator.tsx](file://mobile/src/navigation/AppNavigator.tsx)
- [locations.ts](file://mobile/src/constants/locations.ts)
- [PanoramaScreen.tsx](file://mobile/src/screens/PanoramaScreen.tsx)
- [PanoramaViewer.tsx](file://mobile/src/components/PanoramaViewer.tsx)
- [package.json](file://mobile/package.json)
- [location.controller.ts](file://backend/src/controllers/location.controller.ts)
- [auth.controller.ts](file://backend/src/controllers/auth.controller.ts)
- [location.routes.ts](file://backend/src/routes/location.routes.ts)
- [auth.routes.ts](file://backend/src/routes/auth.routes.ts)
- [auth.middleware.ts](file://backend/src/middleware/auth.middleware.ts)
- [app.ts](file://backend/src/app.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document explains the mobile API integration patterns implemented in the campus panorama application. It focuses on the HTTP service layer, authentication handling, error management, response processing, data fetching strategies, caching, offline behavior, and navigation types. It also covers network connectivity considerations, retry mechanisms, and performance optimizations tailored for mobile environments.

## Project Structure
The mobile client integrates with a backend API via a dedicated service module. The integration spans:
- API service for HTTP requests and token persistence
- Navigation types for typed routing and data models
- React hooks for offline-aware data fetching
- Screens and components that consume the API and present data
- Backend routes and controllers implementing the API contract

```mermaid
graph TB
subgraph "Mobile Client"
API["api.ts<br/>HTTP service"]
Types["navigation.ts<br/>Types & Routes"]
Hook["useLocations.ts<br/>Offline-aware hook"]
Nav["AppNavigator.tsx<br/>Navigation setup"]
LocConst["locations.ts<br/>Static fallback data"]
Screen["PanoramaScreen.tsx<br/>Location detail"]
Viewer["PanoramaViewer.tsx<br/>Panorama renderer"]
end
subgraph "Backend API"
App["app.ts<br/>Express app"]
AuthRoutes["auth.routes.ts<br/>Auth endpoints"]
LocRoutes["location.routes.ts<br/>Location endpoints"]
AuthCtl["auth.controller.ts<br/>Auth handlers"]
LocCtl["location.controller.ts<br/>Location handlers"]
AuthMW["auth.middleware.ts<br/>Auth middleware"]
end
API --> App
Hook --> API
Screen --> API
Viewer --> API
Nav --> Screen
Screen --> LocConst
App --> AuthRoutes
App --> LocRoutes
AuthRoutes --> AuthCtl
LocRoutes --> LocCtl
AuthCtl --> AuthMW
LocCtl --> AuthMW
```

**Diagram sources**
- [api.ts](file://mobile/src/services/api.ts)
- [navigation.ts](file://mobile/src/types/navigation.ts)
- [useLocations.ts](file://mobile/src/hooks/useLocations.ts)
- [AppNavigator.tsx](file://mobile/src/navigation/AppNavigator.tsx)
- [locations.ts](file://mobile/src/constants/locations.ts)
- [PanoramaScreen.tsx](file://mobile/src/screens/PanoramaScreen.tsx)
- [PanoramaViewer.tsx](file://mobile/src/components/PanoramaViewer.tsx)
- [app.ts](file://backend/src/app.ts)
- [auth.routes.ts](file://backend/src/routes/auth.routes.ts)
- [location.routes.ts](file://backend/src/routes/location.routes.ts)
- [auth.controller.ts](file://backend/src/controllers/auth.controller.ts)
- [location.controller.ts](file://backend/src/controllers/location.controller.ts)
- [auth.middleware.ts](file://backend/src/middleware/auth.middleware.ts)

**Section sources**
- [api.ts](file://mobile/src/services/api.ts)
- [navigation.ts](file://mobile/src/types/navigation.ts)
- [useLocations.ts](file://mobile/src/hooks/useLocations.ts)
- [AppNavigator.tsx](file://mobile/src/navigation/AppNavigator.tsx)
- [locations.ts](file://mobile/src/constants/locations.ts)
- [PanoramaScreen.tsx](file://mobile/src/screens/PanoramaScreen.tsx)
- [PanoramaViewer.tsx](file://mobile/src/components/PanoramaViewer.tsx)
- [app.ts](file://backend/src/app.ts)
- [auth.routes.ts](file://backend/src/routes/auth.routes.ts)
- [location.routes.ts](file://backend/src/routes/location.routes.ts)
- [auth.controller.ts](file://backend/src/controllers/auth.controller.ts)
- [location.controller.ts](file://backend/src/controllers/location.controller.ts)
- [auth.middleware.ts](file://backend/src/middleware/auth.middleware.ts)

## Core Components
- API service: Centralized HTTP client with environment-based base URL, token persistence, and location retrieval with caching.
- Navigation types: Strongly-typed navigation params, location model, and panorama metadata.
- Offline-aware hook: Loads data from network or cache depending on connectivity, with graceful fallback and error reporting.
- Screens and components: Present location lists and panorama views, integrating with the API and navigation types.
- Backend API: Exposes endpoints for locations and authentication, protected by middleware.

Key responsibilities:
- Authentication: Login, registration, and current user retrieval with token storage.
- Data fetching: Locations list and individual location details with caching and offline support.
- Error handling: Network failures, invalid responses, and offline scenarios.
- Navigation: Typed routes and parameters for seamless navigation between screens.

**Section sources**
- [api.ts](file://mobile/src/services/api.ts)
- [navigation.ts](file://mobile/src/types/navigation.ts)
- [useLocations.ts](file://mobile/src/hooks/useLocations.ts)
- [PanoramaScreen.tsx](file://mobile/src/screens/PanoramaScreen.tsx)
- [PanoramaViewer.tsx](file://mobile/src/components/PanoramaViewer.tsx)
- [auth.controller.ts](file://backend/src/controllers/auth.controller.ts)
- [location.controller.ts](file://backend/src/controllers/location.controller.ts)

## Architecture Overview
The mobile client communicates with the backend through a typed API service. The service enforces environment configuration, persists tokens, and caches location data. The UI uses typed navigation and a hook that adapts to connectivity.

```mermaid
sequenceDiagram
participant UI as "LocationsScreen"
participant Hook as "useLocations"
participant API as "api.ts"
participant Storage as "AsyncStorage"
participant Net as "NetInfo"
participant BE as "Backend API"
UI->>Hook : "useLocations()"
Hook->>Net : "fetch()"
Net-->>Hook : "connection state"
alt "Online"
Hook->>API : "fetchLocationsFromApi(forceRefresh)"
API->>Storage : "read cache keys"
alt "Cache fresh"
Storage-->>API : "cached locations"
API-->>Hook : "locations"
else "Cache stale or missing"
API->>BE : "GET /api/locations"
BE-->>API : "locations JSON"
API->>Storage : "write cache + timestamp"
API-->>Hook : "locations"
end
else "Offline"
Hook->>API : "fetchLocationsFromApi(false)"
API->>Storage : "attempt read cache"
Storage-->>API : "cached locations or error"
API-->>Hook : "locations or null"
Hook-->>UI : "isOffline=true, optional fallback"
end
Hook-->>UI : "locations, loading state, error"
```

**Diagram sources**
- [useLocations.ts](file://mobile/src/hooks/useLocations.ts)
- [api.ts](file://mobile/src/services/api.ts)
- [locations.ts](file://mobile/src/constants/locations.ts)

**Section sources**
- [useLocations.ts](file://mobile/src/hooks/useLocations.ts)
- [api.ts](file://mobile/src/services/api.ts)
- [locations.ts](file://mobile/src/constants/locations.ts)

## Detailed Component Analysis

### API Service: HTTP Requests, Authentication, Caching, and Offline Behavior
The API service encapsulates:
- Base URL validation and retrieval
- Token persistence and clearing
- Location retrieval with cache and fallback
- Individual location fetching
- Authentication flows (login, register, current user)
- Logout

```mermaid
flowchart TD
Start([Function Entry]) --> CheckBase["Assert API base URL"]
CheckBase --> CacheRead["Read cache + timestamp"]
CacheRead --> CacheFresh{"Cache fresh?"}
CacheFresh --> |Yes| ReturnCache["Return cached locations"]
CacheFresh --> |No| FetchAPI["Fetch /api/locations"]
FetchAPI --> Ok{"response.ok?"}
Ok --> |No| ThrowError["Throw error"]
Ok --> |Yes| Parse["Parse JSON and map to CampusLocation"]
Parse --> WriteCache["Write cache + timestamp"]
WriteCache --> ReturnData["Return locations"]
ReturnCache --> End([Function Exit])
ReturnData --> End
ThrowError --> End
```

**Diagram sources**
- [api.ts](file://mobile/src/services/api.ts)

Key behaviors:
- Environment-driven base URL with explicit validation
- Cache duration and timestamp-based freshness checks
- Fallback to cached data when offline
- Token storage for authentication state
- Structured error handling for network and parsing failures

**Section sources**
- [api.ts](file://mobile/src/services/api.ts)

### Navigation Types and Route Definitions
Navigation types define:
- Hotspots, panorama images, and navigation links
- Campus location and floor structures
- Root stack parameters for typed navigation

```mermaid
classDiagram
class NavigationHotspot {
+string id
+number pitch
+number yaw
+string text
+string targetLocationId
+number targetPanoramaIndex
}
class PanoramaImage {
+string id
+string url
+string title
+NavigationHotspot[] hotspots
}
class NavigationLink {
+string targetLocationId
+number targetPanoramaIndex
+string direction
+string label
}
class CampusLocation {
+string id
+string title
+string description
+number floor
+string category
+PanoramaImage[] panoramas
+NavigationLink[] connections
}
class CampusFloor {
+number floorNumber
+CampusLocation[] locations
}
class RootStackParamList {
+Locations
+Panorama
+FreeNavigation
}
CampusLocation --> PanoramaImage : "contains"
CampusLocation --> NavigationLink : "may connect"
CampusFloor --> CampusLocation : "contains"
```

**Diagram sources**
- [navigation.ts](file://mobile/src/types/navigation.ts)

**Section sources**
- [navigation.ts](file://mobile/src/types/navigation.ts)

### Offline-Aware Data Fetching Hook
The hook coordinates:
- Connectivity detection
- Forced refresh vs. cache-first loading
- Error handling and fallback to cached data
- Automatic re-fetch on connectivity restoration

```mermaid
sequenceDiagram
participant Hook as "useLocations"
participant Net as "NetInfo"
participant API as "api.ts"
participant Storage as "AsyncStorage"
Hook->>Net : "fetch()"
Net-->>Hook : "isConnected && isInternetReachable"
alt "Offline"
Hook->>API : "fetchLocationsFromApi(false)"
API->>Storage : "read cache"
Storage-->>API : "cached data or error"
API-->>Hook : "locations or null"
Hook-->>UI : "isOffline=true, optional error"
else "Online"
Hook->>API : "fetchLocationsFromApi(forceRefresh)"
API-->>Hook : "locations"
Hook-->>UI : "success"
end
Hook->>Net : "subscribe to connectivity changes"
Net-->>Hook : "connectivity restored"
Hook->>API : "fetchLocationsFromApi(true)"
API-->>Hook : "locations"
Hook-->>UI : "synced data"
```

**Diagram sources**
- [useLocations.ts](file://mobile/src/hooks/useLocations.ts)
- [api.ts](file://mobile/src/services/api.ts)

**Section sources**
- [useLocations.ts](file://mobile/src/hooks/useLocations.ts)
- [api.ts](file://mobile/src/services/api.ts)

### Screens and Components Integration
- Locations screen renders lists and supports search and tabs, navigating to the panorama screen with typed parameters.
- Panorama screen resolves the selected location and controls panorama navigation.
- Panorama viewer component manages image caching and Pannellum rendering inside a WebView, with error handling and loading states.

```mermaid
graph LR
Loc["LocationsScreen.tsx"] --> |navigate| Pan["PanoramaScreen.tsx"]
Pan --> |resolve| API["api.ts"]
Pan --> |fallback| Const["locations.ts"]
Pan --> |render| Viewer["PanoramaViewer.tsx"]
Viewer --> |cache| FS["expo-file-system"]
Viewer --> |Pannellum| WV["react-native-webview"]
```

**Diagram sources**
- [PanoramaScreen.tsx](file://mobile/src/screens/PanoramaScreen.tsx)
- [PanoramaViewer.tsx](file://mobile/src/components/PanoramaViewer.tsx)
- [locations.ts](file://mobile/src/constants/locations.ts)
- [api.ts](file://mobile/src/services/api.ts)

**Section sources**
- [PanoramaScreen.tsx](file://mobile/src/screens/PanoramaScreen.tsx)
- [PanoramaViewer.tsx](file://mobile/src/components/PanoramaViewer.tsx)
- [locations.ts](file://mobile/src/constants/locations.ts)
- [api.ts](file://mobile/src/services/api.ts)

### Backend API Contracts
The backend exposes:
- Authentication endpoints for registration, login, and current user info
- Location endpoints for listing, retrieving by ID, and related resources
- Middleware enforcing authentication and admin permissions

```mermaid
graph TB
App["app.ts"]
AuthR["auth.routes.ts"]
LocR["location.routes.ts"]
AuthC["auth.controller.ts"]
LocC["location.controller.ts"]
AuthMW["auth.middleware.ts"]
App --> AuthR
App --> LocR
AuthR --> AuthC
LocR --> LocC
AuthC --> AuthMW
LocC --> AuthMW
```

**Diagram sources**
- [app.ts](file://backend/src/app.ts)
- [auth.routes.ts](file://backend/src/routes/auth.routes.ts)
- [location.routes.ts](file://backend/src/routes/location.routes.ts)
- [auth.controller.ts](file://backend/src/controllers/auth.controller.ts)
- [location.controller.ts](file://backend/src/controllers/location.controller.ts)
- [auth.middleware.ts](file://backend/src/middleware/auth.middleware.ts)

**Section sources**
- [auth.controller.ts](file://backend/src/controllers/auth.controller.ts)
- [location.controller.ts](file://backend/src/controllers/location.controller.ts)
- [auth.routes.ts](file://backend/src/routes/auth.routes.ts)
- [location.routes.ts](file://backend/src/routes/location.routes.ts)
- [auth.middleware.ts](file://backend/src/middleware/auth.middleware.ts)
- [app.ts](file://backend/src/app.ts)

## Dependency Analysis
Mobile dependencies relevant to API integration:
- @react-native-async-storage/async-storage: Token and cache persistence
- @react-native-community/netinfo: Connectivity detection
- react-native-webview: Panorama rendering via embedded HTML
- expo-file-system: Local image caching for panorama assets

```mermaid
graph LR
API["api.ts"] --> AS["@react-native-async-storage/async-storage"]
Hook["useLocations.ts"] --> NI["@react-native-community/netinfo"]
Viewer["PanoramaViewer.tsx"] --> FS["expo-file-system"]
Viewer --> WV["react-native-webview"]
```

**Diagram sources**
- [api.ts](file://mobile/src/services/api.ts)
- [useLocations.ts](file://mobile/src/hooks/useLocations.ts)
- [PanoramaViewer.tsx](file://mobile/src/components/PanoramaViewer.tsx)
- [package.json](file://mobile/package.json)

**Section sources**
- [package.json](file://mobile/package.json)
- [api.ts](file://mobile/src/services/api.ts)
- [useLocations.ts](file://mobile/src/hooks/useLocations.ts)
- [PanoramaViewer.tsx](file://mobile/src/components/PanoramaViewer.tsx)

## Performance Considerations
- Cache strategy: Locations are cached with a fixed TTL and timestamp; on refresh, the cache is bypassed only when forced. This reduces network usage and improves perceived performance.
- Connectivity-aware loading: The hook attempts to load from cache when offline and falls back gracefully, minimizing user disruption.
- Image caching: The panorama viewer caches images locally to reduce repeated downloads and improve transitions between panoramas.
- Network resilience: Errors during cache reads/writes are handled without blocking the UI; the system logs warnings and continues operation.
- Static fallback data: The locations constant file provides a fallback dataset for development and limited scenarios.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Missing base URL: The service validates the API base URL and throws if not configured. Ensure the environment variable is set.
- Cache read/write failures: Errors are logged and do not crash the app; verify storage permissions and disk availability.
- Offline mode: When offline, the hook attempts to serve cached data; if none exists, it surfaces an appropriate error message.
- Authentication errors: Login/register failures surface backend-provided messages; ensure credentials meet validation rules.
- Panorama loading errors: The viewer reports WebView and Pannellum errors; check image URLs and network connectivity.

**Section sources**
- [api.ts](file://mobile/src/services/api.ts)
- [useLocations.ts](file://mobile/src/hooks/useLocations.ts)
- [PanoramaViewer.tsx](file://mobile/src/components/PanoramaViewer.tsx)

## Conclusion
The mobile API integration leverages a centralized service with robust caching, offline support, and typed navigation. The backend provides a clear contract for locations and authentication, while the frontend ensures resilient user experiences across varying network conditions. Extending the integration involves adding new endpoints, updating types, and incorporating retry and exponential backoff strategies as needed.