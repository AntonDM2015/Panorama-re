# Component Relationships

<cite>
**Referenced Files in This Document**
- [backend/src/app.ts](file://backend/src/app.ts)
- [backend/src/server.ts](file://backend/src/server.ts)
- [backend/src/controllers/auth.controller.ts](file://backend/src/controllers/auth.controller.ts)
- [backend/src/services/auth.service.ts](file://backend/src/services/auth.service.ts)
- [backend/src/repositories/user.repository.ts](file://backend/src/repositories/user.repository.ts)
- [backend/src/routes/auth.routes.ts](file://backend/src/routes/auth.routes.ts)
- [backend/src/middleware/auth.middleware.ts](file://backend/src/middleware/auth.middleware.ts)
- [backend/package.json](file://backend/package.json)
- [web/src/App.tsx](file://web/src/App.tsx)
- [web/src/pages/HomePage.tsx](file://web/src/pages/HomePage.tsx)
- [web/src/components/Header.tsx](file://web/src/components/Header.tsx)
- [web/src/services/api.ts](file://web/src/services/api.ts)
- [web/src/types/index.ts](file://web/src/types/index.ts)
- [web/package.json](file://web/package.json)
- [mobile/App.tsx](file://mobile/App.tsx)
- [mobile/src/navigation/AppNavigator.tsx](file://mobile/src/navigation/AppNavigator.tsx)
- [mobile/src/screens/LocationsScreen.tsx](file://mobile/src/screens/LocationsScreen.tsx)
- [mobile/src/screens/PanoramaScreen.tsx](file://mobile/src/screens/PanoramaScreen.tsx)
- [mobile/src/components/PanoramaViewer.tsx](file://mobile/src/components/PanoramaViewer.tsx)
- [mobile/src/hooks/useLocations.ts](file://mobile/src/hooks/useLocations.ts)
- [mobile/src/services/api.ts](file://mobile/src/services/api.ts)
- [mobile/src/constants/locations.ts](file://mobile/src/constants/locations.ts)
- [mobile/package.json](file://mobile/package.json)
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
10. [Appendices](#appendices)

## Introduction
This document explains the component relationships across the Panorama system, covering:
- Backend MVC architecture: controllers, services, and repositories
- Web application component hierarchy and REST communication
- Mobile application architecture with React Native navigation and local state
- Interaction diagrams showing data flow, dependency injection patterns, and service abstractions
- Component lifecycle, event handling, and cross-platform state synchronization

## Project Structure
The system consists of three primary parts:
- Backend: Express server with TypeScript, routing, middleware, controllers, services, and repositories
- Web: React SPA with pages, components, and an API service layer
- Mobile: React Native app with navigation, screens, components, and a local API service

```mermaid
graph TB
subgraph "Backend"
BE_App["Express App<br/>backend/src/app.ts"]
BE_Server["Server Bootstrap<br/>backend/src/server.ts"]
BE_Routes["Routes<br/>backend/src/routes/*"]
BE_Controllers["Controllers<br/>backend/src/controllers/*"]
BE_Services["Services<br/>backend/src/services/*"]
BE_Repos["Repositories<br/>backend/src/repositories/*"]
BE_DB["Supabase DB"]
end
subgraph "Web"
WEB_App["React App<br/>web/src/App.tsx"]
WEB_Pages["Pages<br/>web/src/pages/*"]
WEB_Components["Components<br/>web/src/components/*"]
WEB_API["API Service<br/>web/src/services/api.ts"]
WEB_Types["Types<br/>web/src/types/index.ts"]
end
subgraph "Mobile"
MOB_App["App Root<br/>mobile/App.tsx"]
MOB_Nav["Navigator<br/>mobile/src/navigation/AppNavigator.tsx"]
MOB_Screens["Screens<br/>mobile/src/screens/*"]
MOB_Components["Components<br/>mobile/src/components/*"]
MOB_Hooks["Hooks<br/>mobile/src/hooks/*"]
MOB_API["API Service<br/>mobile/src/services/api.ts"]
end
BE_App --> BE_Routes
BE_Routes --> BE_Controllers
BE_Controllers --> BE_Services
BE_Services --> BE_Repos
BE_Repos --> BE_DB
WEB_API --> BE_App
MOB_API --> BE_App
WEB_App --> WEB_Pages
WEB_App --> WEB_Components
WEB_Pages --> WEB_API
WEB_Components --> WEB_API
MOB_App --> MOB_Nav
MOB_Nav --> MOB_Screens
MOB_Screens --> MOB_Components
MOB_Screens --> MOB_API
MOB_Components --> MOB_API
MOB_Hooks --> MOB_API
```

**Diagram sources**
- [backend/src/app.ts:1-71](file://backend/src/app.ts#L1-L71)
- [backend/src/server.ts:1-19](file://backend/src/server.ts#L1-L19)
- [backend/src/routes/auth.routes.ts:1-12](file://backend/src/routes/auth.routes.ts#L1-L12)
- [backend/src/controllers/auth.controller.ts:1-53](file://backend/src/controllers/auth.controller.ts#L1-L53)
- [backend/src/services/auth.service.ts:1-87](file://backend/src/services/auth.service.ts#L1-L87)
- [backend/src/repositories/user.repository.ts:1-88](file://backend/src/repositories/user.repository.ts#L1-L88)
- [web/src/App.tsx:1-29](file://web/src/App.tsx#L1-L29)
- [web/src/services/api.ts:1-332](file://web/src/services/api.ts#L1-L332)
- [mobile/App.tsx:1-14](file://mobile/App.tsx#L1-L14)
- [mobile/src/navigation/AppNavigator.tsx](file://mobile/src/navigation/AppNavigator.tsx)
- [mobile/src/screens/LocationsScreen.tsx](file://mobile/src/screens/LocationsScreen.tsx)
- [mobile/src/screens/PanoramaScreen.tsx](file://mobile/src/screens/PanoramaScreen.tsx)
- [mobile/src/components/PanoramaViewer.tsx](file://mobile/src/components/PanoramaViewer.tsx)
- [mobile/src/hooks/useLocations.ts](file://mobile/src/hooks/useLocations.ts)
- [mobile/src/services/api.ts](file://mobile/src/services/api.ts)

**Section sources**
- [backend/src/app.ts:1-71](file://backend/src/app.ts#L1-L71)
- [backend/src/server.ts:1-19](file://backend/src/server.ts#L1-L19)
- [web/src/App.tsx:1-29](file://web/src/App.tsx#L1-L29)
- [mobile/App.tsx:1-14](file://mobile/App.tsx#L1-L14)

## Core Components
- Backend Express app initializes middleware, static file serving, rate limiting, health check, and routes. It exports the configured app for server startup.
- Controllers handle HTTP requests, validate inputs, and delegate to services.
- Services encapsulate business logic, orchestrating repository calls and returning domain-specific results.
- Repositories abstract data access via Supabase client, mapping rows to domain entities.
- Web API service wraps Axios, injects auth tokens, and exposes typed functions per domain resource.
- Mobile API service mirrors backend endpoints and integrates with native modules and navigation.
- Types define shared interfaces across platforms for consistent state modeling.

**Section sources**
- [backend/src/app.ts:1-71](file://backend/src/app.ts#L1-L71)
- [backend/src/controllers/auth.controller.ts:1-53](file://backend/src/controllers/auth.controller.ts#L1-L53)
- [backend/src/services/auth.service.ts:1-87](file://backend/src/services/auth.service.ts#L1-L87)
- [backend/src/repositories/user.repository.ts:1-88](file://backend/src/repositories/user.repository.ts#L1-L88)
- [web/src/services/api.ts:1-332](file://web/src/services/api.ts#L1-L332)
- [web/src/types/index.ts:1-65](file://web/src/types/index.ts#L1-L65)
- [mobile/src/services/api.ts](file://mobile/src/services/api.ts)
- [mobile/src/constants/locations.ts](file://mobile/src/constants/locations.ts)

## Architecture Overview
The system follows a layered backend MVC pattern with clear separation of concerns:
- Controllers: HTTP entry points, input parsing/validation, and response formatting
- Services: Business rules, token generation, and orchestration of repositories
- Repositories: Data persistence and mapping to domain entities
- Frontends: Pages and components consume a typed API service layer

```mermaid
graph LR
ClientWeb["Web Browser"] --> WebAPI["web/src/services/api.ts"]
ClientMobile["Mobile Device"] --> MobileAPI["mobile/src/services/api.ts"]
WebAPI --> ExpressApp["backend/src/app.ts"]
MobileAPI --> ExpressApp
subgraph "Backend Layer"
ExpressApp --> Routes["Routes"]
Routes --> Controllers["Controllers"]
Controllers --> Services["Services"]
Services --> Repositories["Repositories"]
Repositories --> DB["Supabase"]
end
```

**Diagram sources**
- [backend/src/app.ts:1-71](file://backend/src/app.ts#L1-L71)
- [web/src/services/api.ts:1-332](file://web/src/services/api.ts#L1-L332)
- [mobile/src/services/api.ts](file://mobile/src/services/api.ts)

## Detailed Component Analysis

### Backend MVC Pattern
The backend implements a clean MVC pattern:
- Controllers receive requests, validate inputs, and call services
- Services encapsulate business logic and coordinate repositories
- Repositories abstract database operations and map to domain entities

```mermaid
classDiagram
class AuthController {
+registerController(req,res,next)
+loginController(req,res,next)
+meController(req,res,next)
}
class AuthService {
+registerUser(params)
+loginUser(params)
}
class UserRepository {
+findUserByEmail(email)
+findUserById(id)
+createUser(params)
}
AuthController --> AuthService : "calls"
AuthService --> UserRepository : "uses"
```

**Diagram sources**
- [backend/src/controllers/auth.controller.ts:1-53](file://backend/src/controllers/auth.controller.ts#L1-L53)
- [backend/src/services/auth.service.ts:1-87](file://backend/src/services/auth.service.ts#L1-L87)
- [backend/src/repositories/user.repository.ts:1-88](file://backend/src/repositories/user.repository.ts#L1-L88)

**Section sources**
- [backend/src/controllers/auth.controller.ts:1-53](file://backend/src/controllers/auth.controller.ts#L1-L53)
- [backend/src/services/auth.service.ts:1-87](file://backend/src/services/auth.service.ts#L1-L87)
- [backend/src/repositories/user.repository.ts:1-88](file://backend/src/repositories/user.repository.ts#L1-L88)

### Authentication Flow (Web)
The Web frontend authenticates via the backend and stores tokens locally for subsequent requests.

```mermaid
sequenceDiagram
participant User as "Web User"
participant Page as "HomePage.tsx"
participant API as "web/src/services/api.ts"
participant Ctrl as "backend/src/controllers/auth.controller.ts"
participant Svc as "backend/src/services/auth.service.ts"
participant Repo as "backend/src/repositories/user.repository.ts"
User->>Page : "Submit login form"
Page->>API : "login(email,password)"
API->>Ctrl : "POST /api/auth/login"
Ctrl->>Svc : "loginUser({email,password})"
Svc->>Repo : "findUserByEmail(email)"
Repo-->>Svc : "UserEntity or null"
Svc->>Svc : "compare password"
Svc-->>Ctrl : "{user,tokens}"
Ctrl-->>API : "{user,tokens}"
API->>API : "setAuthToken(token)"
API-->>Page : "AuthResponse"
Page-->>User : "Navigate to dashboard"
```

**Diagram sources**
- [web/src/pages/HomePage.tsx:1-114](file://web/src/pages/HomePage.tsx#L1-L114)
- [web/src/services/api.ts:1-332](file://web/src/services/api.ts#L1-L332)
- [backend/src/controllers/auth.controller.ts:1-53](file://backend/src/controllers/auth.controller.ts#L1-L53)
- [backend/src/services/auth.service.ts:1-87](file://backend/src/services/auth.service.ts#L1-L87)
- [backend/src/repositories/user.repository.ts:1-88](file://backend/src/repositories/user.repository.ts#L1-L88)

**Section sources**
- [web/src/pages/HomePage.tsx:1-114](file://web/src/pages/HomePage.tsx#L1-L114)
- [web/src/services/api.ts:1-332](file://web/src/services/api.ts#L1-L332)
- [backend/src/controllers/auth.controller.ts:1-53](file://backend/src/controllers/auth.controller.ts#L1-L53)
- [backend/src/services/auth.service.ts:1-87](file://backend/src/services/auth.service.ts#L1-L87)
- [backend/src/repositories/user.repository.ts:1-88](file://backend/src/repositories/user.repository.ts#L1-L88)

### Authentication Middleware
The backend enforces authorization using bearer tokens.

```mermaid
flowchart TD
Start(["Incoming Request"]) --> CheckAuth["requireAuth middleware"]
CheckAuth --> HasToken{"Has Bearer Token?"}
HasToken --> |No| Unauthorized["401 Unauthorized"]
HasToken --> |Yes| Verify["verifyAccessToken(token)"]
Verify --> Valid{"Valid JWT?"}
Valid --> |No| InvalidToken["401 Invalid/expired token"]
Valid --> |Yes| AttachUser["Attach user to req"]
AttachUser --> Next["Call next()"]
Unauthorized --> End(["End"])
InvalidToken --> End
Next --> End
```

**Diagram sources**
- [backend/src/middleware/auth.middleware.ts:1-52](file://backend/src/middleware/auth.middleware.ts#L1-L52)

**Section sources**
- [backend/src/middleware/auth.middleware.ts:1-52](file://backend/src/middleware/auth.middleware.ts#L1-L52)

### Web Application Component Hierarchy
The Web app composes pages and components that communicate with the backend via a typed API service.

```mermaid
graph TB
App["web/src/App.tsx"]
Home["web/src/pages/HomePage.tsx"]
HeaderC["web/src/components/Header.tsx"]
APIService["web/src/services/api.ts"]
Types["web/src/types/index.ts"]
App --> Home
App --> HeaderC
Home --> APIService
HeaderC --> APIService
APIService --> Types
```

**Diagram sources**
- [web/src/App.tsx:1-29](file://web/src/App.tsx#L1-L29)
- [web/src/pages/HomePage.tsx:1-114](file://web/src/pages/HomePage.tsx#L1-L114)
- [web/src/components/Header.tsx:1-36](file://web/src/components/Header.tsx#L1-L36)
- [web/src/services/api.ts:1-332](file://web/src/services/api.ts#L1-L332)
- [web/src/types/index.ts:1-65](file://web/src/types/index.ts#L1-L65)

**Section sources**
- [web/src/App.tsx:1-29](file://web/src/App.tsx#L1-L29)
- [web/src/pages/HomePage.tsx:1-114](file://web/src/pages/HomePage.tsx#L1-L114)
- [web/src/components/Header.tsx:1-36](file://web/src/components/Header.tsx#L1-L36)
- [web/src/services/api.ts:1-332](file://web/src/services/api.ts#L1-L332)
- [web/src/types/index.ts:1-65](file://web/src/types/index.ts#L1-L65)

### Mobile Application Architecture
The mobile app uses React Navigation for screen transitions and a dedicated API service for backend communication.

```mermaid
graph TB
Root["mobile/App.tsx"]
Nav["mobile/src/navigation/AppNavigator.tsx"]
LocScreen["mobile/src/screens/LocationsScreen.tsx"]
PanScreen["mobile/src/screens/PanoramaScreen.tsx"]
Viewer["mobile/src/components/PanoramaViewer.tsx"]
Hooks["mobile/src/hooks/useLocations.ts"]
APIService["mobile/src/services/api.ts"]
Consts["mobile/src/constants/locations.ts"]
Root --> Nav
Nav --> LocScreen
Nav --> PanScreen
PanScreen --> Viewer
LocScreen --> Hooks
LocScreen --> APIService
PanScreen --> APIService
Viewer --> APIService
Hooks --> APIService
APIService --> Consts
```

**Diagram sources**
- [mobile/App.tsx:1-14](file://mobile/App.tsx#L1-L14)
- [mobile/src/navigation/AppNavigator.tsx](file://mobile/src/navigation/AppNavigator.tsx)
- [mobile/src/screens/LocationsScreen.tsx](file://mobile/src/screens/LocationsScreen.tsx)
- [mobile/src/screens/PanoramaScreen.tsx](file://mobile/src/screens/PanoramaScreen.tsx)
- [mobile/src/components/PanoramaViewer.tsx](file://mobile/src/components/PanoramaViewer.tsx)
- [mobile/src/hooks/useLocations.ts](file://mobile/src/hooks/useLocations.ts)
- [mobile/src/services/api.ts](file://mobile/src/services/api.ts)
- [mobile/src/constants/locations.ts](file://mobile/src/constants/locations.ts)

**Section sources**
- [mobile/App.tsx:1-14](file://mobile/App.tsx#L1-L14)
- [mobile/src/navigation/AppNavigator.tsx](file://mobile/src/navigation/AppNavigator.tsx)
- [mobile/src/screens/LocationsScreen.tsx](file://mobile/src/screens/LocationsScreen.tsx)
- [mobile/src/screens/PanoramaScreen.tsx](file://mobile/src/screens/PanoramaScreen.tsx)
- [mobile/src/components/PanoramaViewer.tsx](file://mobile/src/components/PanoramaViewer.tsx)
- [mobile/src/hooks/useLocations.ts](file://mobile/src/hooks/useLocations.ts)
- [mobile/src/services/api.ts](file://mobile/src/services/api.ts)
- [mobile/src/constants/locations.ts](file://mobile/src/constants/locations.ts)

### Cross-Platform Data Contracts
Shared types ensure consistent state across platforms.

```mermaid
erDiagram
USER {
string id PK
string email
string role
}
CITY {
string id PK
string name
string country
}
BUILDING {
string id PK
string cityId FK
string name
string address
string description
string previewUrl
}
LOCATION {
string id PK
string buildingId FK
string name
string description
number floor
string type
string roomNumber
string previewUrl
string panoramaUrl
}
PANORAMA_IMAGE {
string id PK
string locationId FK
string url
string title
number sortOrder
}
NAVIGATION_LINK {
string id PK
string fromLocationId FK
string toLocationId FK
string direction
}
USER ||--o{ BUILDING : "owns"
CITY ||--o{ BUILDING : "contains"
BUILDING ||--o{ LOCATION : "contains"
LOCATION ||--o{ PANORAMA_IMAGE : "has"
LOCATION ||--o{ NAVIGATION_LINK : "originates"
```

**Diagram sources**
- [web/src/types/index.ts:1-65](file://web/src/types/index.ts#L1-L65)

**Section sources**
- [web/src/types/index.ts:1-65](file://web/src/types/index.ts#L1-L65)

## Dependency Analysis
- Backend dependencies include Express, CORS, Helmet, rate limiting, JWT utilities, and Supabase client. These enable secure HTTP handling, authentication, and database access.
- Web dependencies include React, React Router DOM, and Axios for HTTP requests.
- Mobile dependencies include React Navigation, Expo, and React Native ecosystem packages.

```mermaid
graph TB
BE_Pkg["backend/package.json"]
WEB_Pkg["web/package.json"]
MOB_Pkg["mobile/package.json"]
BE_Pkg --> ExpressDep["express"]
BE_Pkg --> SupabaseDep["@supabase/supabase-js"]
BE_Pkg --> JWTDep["jsonwebtoken"]
BE_Pkg --> RateLimitDep["express-rate-limit"]
WEB_Pkg --> ReactDep["react"]
WEB_Pkg --> RouterDep["react-router-dom"]
WEB_Pkg --> AxiosDep["axios"]
MOB_Pkg --> RNDep["react-native"]
MOB_Pkg --> NavDep["@react-navigation/native"]
MOB_Pkg --> ExpoDep["expo"]
```

**Diagram sources**
- [backend/package.json:1-54](file://backend/package.json#L1-L54)
- [web/package.json:1-25](file://web/package.json#L1-L25)
- [mobile/package.json:1-37](file://mobile/package.json#L1-L37)

**Section sources**
- [backend/package.json:1-54](file://backend/package.json#L1-L54)
- [web/package.json:1-25](file://web/package.json#L1-L25)
- [mobile/package.json:1-37](file://mobile/package.json#L1-L37)

## Performance Considerations
- Backend
  - Static image serving for panoramas with caching headers reduces bandwidth and improves load times.
  - Rate limiting protects endpoints from abuse.
  - Health check endpoint enables monitoring and readiness probes.
- Web
  - Centralized API service with interceptors ensures consistent auth token injection and error handling.
  - Component-level loading and error states improve perceived performance and UX.
- Mobile
  - Local state hooks reduce unnecessary re-renders.
  - Native navigation and lightweight components optimize rendering performance.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
- Backend
  - Authentication failures: verify token presence and validity; ensure middleware attaches user context.
  - Database errors: check repository mappings and Supabase connection.
- Web
  - API errors: inspect request interceptors and token storage; confirm base URL configuration.
  - UI errors: review page lifecycle hooks and state updates.
- Mobile
  - Navigation issues: verify navigator stack and screen props.
  - API errors: confirm endpoint URLs and token handling.

**Section sources**
- [backend/src/middleware/auth.middleware.ts:1-52](file://backend/src/middleware/auth.middleware.ts#L1-L52)
- [backend/src/repositories/user.repository.ts:1-88](file://backend/src/repositories/user.repository.ts#L1-L88)
- [web/src/services/api.ts:1-332](file://web/src/services/api.ts#L1-L332)
- [web/src/pages/HomePage.tsx:1-114](file://web/src/pages/HomePage.tsx#L1-L114)
- [mobile/src/services/api.ts](file://mobile/src/services/api.ts)

## Conclusion
The Panorama system cleanly separates concerns across backend and frontend platforms:
- Backend MVC ensures maintainable business logic and data access
- Web and Mobile share a typed API contract for reliable communication
- Navigation and component hierarchies provide intuitive user experiences
- Interceptor-based auth and centralized services simplify cross-cutting concerns

[No sources needed since this section summarizes without analyzing specific files]

## Appendices
- Component lifecycle management
  - Web: Pages mount, fetch data via effects, and update state; error boundaries and loading states improve resilience.
  - Mobile: Screens integrate with navigation lifecycles; hooks encapsulate side effects and state.
- Event handling and state synchronization
  - Web: Axios interceptors propagate auth tokens; local state updates trigger re-renders.
  - Mobile: Navigation events drive screen transitions; local hooks synchronize UI state.

[No sources needed since this section provides general guidance]