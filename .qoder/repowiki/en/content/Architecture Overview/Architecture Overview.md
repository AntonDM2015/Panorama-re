# Architecture Overview

<cite>
**Referenced Files in This Document**
- [backend/src/app.ts](file://backend/src/app.ts)
- [backend/src/server.ts](file://backend/src/server.ts)
- [backend/src/config/env.ts](file://backend/src/config/env.ts)
- [backend/src/controllers/auth.controller.ts](file://backend/src/controllers/auth.controller.ts)
- [backend/src/services/auth.service.ts](file://backend/src/services/auth.service.ts)
- [backend/src/middleware/auth.middleware.ts](file://backend/src/middleware/auth.middleware.ts)
- [backend/src/repositories/user.repository.ts](file://backend/src/repositories/user.repository.ts)
- [backend/src/utils/jwt.ts](file://backend/src/utils/jwt.ts)
- [web/src/App.tsx](file://web/src/App.tsx)
- [web/src/pages/HomePage.tsx](file://web/src/pages/HomePage.tsx)
- [web/src/components/PanoramaViewer.tsx](file://web/src/components/PanoramaViewer.tsx)
- [web/src/services/api.ts](file://web/src/services/api.ts)
- [mobile/App.tsx](file://mobile/App.tsx)
- [mobile/src/navigation/AppNavigator.tsx](file://mobile/src/navigation/AppNavigator.tsx)
- [mobile/src/screens/LocationsScreen.tsx](file://mobile/src/screens/LocationsScreen.tsx)
- [mobile/src/services/api.ts](file://mobile/src/services/api.ts)
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
This document presents the architecture of the Panorama system, a campus virtual tour platform with a backend API, a web frontend, and a mobile application. The backend follows an MVC-style layered architecture with clear separation of concerns: controllers handle HTTP requests, services encapsulate business logic, repositories manage persistence via Supabase, and utilities provide shared functionality such as JWT signing and verification. The web frontend uses React with component-based architecture and routing, while the mobile application uses React Native with a native navigation stack. All clients communicate with the backend through RESTful APIs secured with JWT-based authentication.

## Project Structure
The repository is organized into three main areas:
- Backend: Express-based REST API with TypeScript, layered architecture, and Supabase integration
- Web: React SPA with routing and component-based UI
- Mobile: React Native application with native navigation and screens

```mermaid
graph TB
subgraph "Backend"
APP["Express App<br/>backend/src/app.ts"]
SRV["Server Bootstrap<br/>backend/src/server.ts"]
ENV["Environment Config<br/>backend/src/config/env.ts"]
CTRL_AUTH["Auth Controller<br/>backend/src/controllers/auth.controller.ts"]
MWARE_AUTH["Auth Middleware<br/>backend/src/middleware/auth.middleware.ts"]
SVC_AUTH["Auth Service<br/>backend/src/services/auth.service.ts"]
REPO_USER["User Repository<br/>backend/src/repositories/user.repository.ts"]
UTIL_JWT["JWT Utils<br/>backend/src/utils/jwt.ts"]
end
subgraph "Web Frontend"
WEB_APP["React App Router<br/>web/src/App.tsx"]
HOME_PAGE["Home Page<br/>web/src/pages/HomePage.tsx"]
PANO_VIEWER["Panorama Viewer<br/>web/src/components/PanoramaViewer.tsx"]
WEB_API["Web API Client<br/>web/src/services/api.ts"]
end
subgraph "Mobile App"
MOB_APP["App Root<br/>mobile/App.tsx"]
NAVIGATOR["Navigator<br/>mobile/src/navigation/AppNavigator.tsx"]
LOC_SCREEN["Locations Screen<br/>mobile/src/screens/LocationsScreen.tsx"]
MOB_API["Mobile API Client<br/>mobile/src/services/api.ts"]
end
WEB_APP --> WEB_API
HOME_PAGE --> WEB_API
PANO_VIEWER --> WEB_API
MOB_APP --> NAVIGATOR
NAVIGATOR --> LOC_SCREEN
LOC_SCREEN --> MOB_API
WEB_API --> APP
MOB_API --> APP
APP --> SRV
APP --> ENV
CTRL_AUTH --> SVC_AUTH
SVC_AUTH --> REPO_USER
MWARE_AUTH --> UTIL_JWT
REPO_USER --> ENV
```

**Diagram sources**
- [backend/src/app.ts:1-71](file://backend/src/app.ts#L1-L71)
- [backend/src/server.ts:1-19](file://backend/src/server.ts#L1-L19)
- [backend/src/config/env.ts:1-33](file://backend/src/config/env.ts#L1-L33)
- [backend/src/controllers/auth.controller.ts:1-53](file://backend/src/controllers/auth.controller.ts#L1-L53)
- [backend/src/middleware/auth.middleware.ts:1-52](file://backend/src/middleware/auth.middleware.ts#L1-L52)
- [backend/src/services/auth.service.ts:1-87](file://backend/src/services/auth.service.ts#L1-L87)
- [backend/src/repositories/user.repository.ts:1-88](file://backend/src/repositories/user.repository.ts#L1-L88)
- [backend/src/utils/jwt.ts:1-53](file://backend/src/utils/jwt.ts#L1-L53)
- [web/src/App.tsx:1-29](file://web/src/App.tsx#L1-L29)
- [web/src/pages/HomePage.tsx:1-114](file://web/src/pages/HomePage.tsx#L1-L114)
- [web/src/components/PanoramaViewer.tsx:1-196](file://web/src/components/PanoramaViewer.tsx#L1-L196)
- [web/src/services/api.ts:1-332](file://web/src/services/api.ts#L1-L332)
- [mobile/App.tsx:1-14](file://mobile/App.tsx#L1-L14)
- [mobile/src/navigation/AppNavigator.tsx:1-45](file://mobile/src/navigation/AppNavigator.tsx#L1-L45)
- [mobile/src/screens/LocationsScreen.tsx:1-482](file://mobile/src/screens/LocationsScreen.tsx#L1-L482)

**Section sources**
- [backend/src/app.ts:1-71](file://backend/src/app.ts#L1-L71)
- [backend/src/server.ts:1-19](file://backend/src/server.ts#L1-L19)
- [web/src/App.tsx:1-29](file://web/src/App.tsx#L1-L29)
- [mobile/App.tsx:1-14](file://mobile/App.tsx#L1-L14)

## Core Components
- Backend API server: Initializes middleware, routes, static file serving, and health checks; exposes REST endpoints under /api/*
- Authentication controller and service: Handle registration, login, and profile retrieval with JWT issuance
- Authorization middleware: Enforces bearer token validation and admin permissions
- User repository: Persists and retrieves user data via Supabase
- JWT utilities: Sign and verify access and refresh tokens using environment-configured secrets
- Web client: Axios-based HTTP client with automatic auth token injection and comprehensive CRUD helpers
- Mobile client: Axios-based HTTP client mirroring web API surface
- Frontend components: React pages and viewers orchestrating data fetching and rendering
- Mobile screens: Native navigation-driven screens for browsing locations and viewing panoramas

**Section sources**
- [backend/src/controllers/auth.controller.ts:1-53](file://backend/src/controllers/auth.controller.ts#L1-L53)
- [backend/src/services/auth.service.ts:1-87](file://backend/src/services/auth.service.ts#L1-L87)
- [backend/src/middleware/auth.middleware.ts:1-52](file://backend/src/middleware/auth.middleware.ts#L1-L52)
- [backend/src/repositories/user.repository.ts:1-88](file://backend/src/repositories/user.repository.ts#L1-L88)
- [backend/src/utils/jwt.ts:1-53](file://backend/src/utils/jwt.ts#L1-L53)
- [web/src/services/api.ts:1-332](file://web/src/services/api.ts#L1-L332)
- [mobile/src/services/api.ts](file://mobile/src/services/api.ts)

## Architecture Overview
The system is a client-server architecture with:
- Centralized backend API exposing REST endpoints
- Stateless clients (web and mobile) that fetch data and render UI
- Supabase as the database and storage provider
- JWT-based authentication with access and refresh tokens
- Static asset serving for panorama images

```mermaid
graph TB
CLIENT_WEB["Web Client<br/>React SPA"]
CLIENT_MOBILE["Mobile Client<br/>React Native"]
API_SERVER["Backend API<br/>Express + TypeScript"]
AUTH_MW["Auth Middleware<br/>Bearer Token Validation"]
AUTH_CTRL["Auth Controller<br/>Registration/Login/Profile"]
AUTH_SVC["Auth Service<br/>Business Logic"]
USER_REPO["User Repository<br/>Supabase Users"]
JWT_UTIL["JWT Utilities<br/>Sign/Verify Tokens"]
DB_STORAGE["Supabase Storage<br/>Panorama Images"]
CLIENT_WEB --> API_SERVER
CLIENT_MOBILE --> API_SERVER
API_SERVER --> AUTH_MW
AUTH_MW --> JWT_UTIL
AUTH_MW --> AUTH_CTRL
AUTH_CTRL --> AUTH_SVC
AUTH_SVC --> USER_REPO
API_SERVER --> DB_STORAGE
```

**Diagram sources**
- [backend/src/app.ts:1-71](file://backend/src/app.ts#L1-L71)
- [backend/src/middleware/auth.middleware.ts:1-52](file://backend/src/middleware/auth.middleware.ts#L1-L52)
- [backend/src/controllers/auth.controller.ts:1-53](file://backend/src/controllers/auth.controller.ts#L1-L53)
- [backend/src/services/auth.service.ts:1-87](file://backend/src/services/auth.service.ts#L1-L87)
- [backend/src/repositories/user.repository.ts:1-88](file://backend/src/repositories/user.repository.ts#L1-L88)
- [backend/src/utils/jwt.ts:1-53](file://backend/src/utils/jwt.ts#L1-L53)

## Detailed Component Analysis

### Backend MVC Pattern and Security
The backend implements a layered MVC-like structure:
- Controllers: Parse and validate request bodies, delegate to services, and return JSON responses
- Services: Encapsulate business logic (e.g., user registration and login)
- Repositories: Abstract persistence using Supabase
- Middleware: Global and route-specific middleware for security and error handling
- Utilities: JWT signing and verification

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
+findUserById(userId)
+createUser(params)
}
class AuthMiddleware {
+requireAuth(req,res,next)
+requireAdmin(req,res,next)
}
class JWTUtils {
+signAccessToken(payload)
+signRefreshToken(payload)
+verifyAccessToken(token)
+verifyRefreshToken(token)
}
AuthController --> AuthService : "calls"
AuthService --> UserRepository : "persists/fetches"
AuthController --> JWTUtils : "issues tokens"
AuthMiddleware --> JWTUtils : "validates tokens"
```

**Diagram sources**
- [backend/src/controllers/auth.controller.ts:1-53](file://backend/src/controllers/auth.controller.ts#L1-L53)
- [backend/src/services/auth.service.ts:1-87](file://backend/src/services/auth.service.ts#L1-L87)
- [backend/src/repositories/user.repository.ts:1-88](file://backend/src/repositories/user.repository.ts#L1-L88)
- [backend/src/middleware/auth.middleware.ts:1-52](file://backend/src/middleware/auth.middleware.ts#L1-L52)
- [backend/src/utils/jwt.ts:1-53](file://backend/src/utils/jwt.ts#L1-L53)

**Section sources**
- [backend/src/controllers/auth.controller.ts:1-53](file://backend/src/controllers/auth.controller.ts#L1-L53)
- [backend/src/services/auth.service.ts:1-87](file://backend/src/services/auth.service.ts#L1-L87)
- [backend/src/middleware/auth.middleware.ts:1-52](file://backend/src/middleware/auth.middleware.ts#L1-L52)
- [backend/src/repositories/user.repository.ts:1-88](file://backend/src/repositories/user.repository.ts#L1-L88)
- [backend/src/utils/jwt.ts:1-53](file://backend/src/utils/jwt.ts#L1-L53)

### API Communication Protocols and Data Flow
Clients communicate with the backend using REST over HTTPS. The web and mobile clients share a similar API surface via dedicated service modules.

```mermaid
sequenceDiagram
participant Browser as "Web Client"
participant API as "Backend API"
participant AuthMW as "Auth Middleware"
participant AuthCtrl as "Auth Controller"
participant AuthSvc as "Auth Service"
participant UserRepo as "User Repository"
Browser->>API : POST /api/auth/login {email,password}
API->>AuthMW : requireAuth (applies to auth routes)
AuthMW-->>API : validated token or error
API->>AuthCtrl : loginController()
AuthCtrl->>AuthSvc : loginUser(params)
AuthSvc->>UserRepo : findUserByEmail(email)
UserRepo-->>AuthSvc : UserEntity or null
AuthSvc-->>AuthCtrl : {user,tokens}
AuthCtrl-->>Browser : 200 {user,tokens}
```

**Diagram sources**
- [web/src/services/api.ts:277-285](file://web/src/services/api.ts#L277-L285)
- [backend/src/controllers/auth.controller.ts:30-42](file://backend/src/controllers/auth.controller.ts#L30-L42)
- [backend/src/services/auth.service.ts:65-86](file://backend/src/services/auth.service.ts#L65-L86)
- [backend/src/repositories/user.repository.ts:29-44](file://backend/src/repositories/user.repository.ts#L29-L44)
- [backend/src/middleware/auth.middleware.ts:19-39](file://backend/src/middleware/auth.middleware.ts#L19-L39)

**Section sources**
- [web/src/services/api.ts:277-285](file://web/src/services/api.ts#L277-L285)
- [backend/src/controllers/auth.controller.ts:30-42](file://backend/src/controllers/auth.controller.ts#L30-L42)
- [backend/src/services/auth.service.ts:65-86](file://backend/src/services/auth.service.ts#L65-L86)
- [backend/src/repositories/user.repository.ts:29-44](file://backend/src/repositories/user.repository.ts#L29-L44)
- [backend/src/middleware/auth.middleware.ts:19-39](file://backend/src/middleware/auth.middleware.ts#L19-L39)

### Frontend Component-Based Architecture
The web frontend uses React with:
- Routing via React Router DOM
- Pages fetching data from the backend via the API client
- Reusable components (e.g., PanoramaViewer) rendering interactive 360° views

```mermaid
flowchart TD
Start(["Home Page Mount"]) --> FetchCities["Call getCities()"]
FetchCities --> APICall["HTTP GET /api/cities"]
APICall --> Success{"Response OK?"}
Success --> |Yes| SetData["Set cities state"]
Success --> |No| HandleError["Set error state"]
SetData --> RenderGrid["Render city grid"]
HandleError --> ShowErrorUI["Show error UI"]
RenderGrid --> Navigate["User clicks city -> navigate to CityPage"]
```

**Diagram sources**
- [web/src/pages/HomePage.tsx:12-39](file://web/src/pages/HomePage.tsx#L12-L39)
- [web/src/services/api.ts:27-35](file://web/src/services/api.ts#L27-L35)
- [web/src/App.tsx:10-26](file://web/src/App.tsx#L10-L26)

**Section sources**
- [web/src/pages/HomePage.tsx:12-39](file://web/src/pages/HomePage.tsx#L12-L39)
- [web/src/services/api.ts:27-35](file://web/src/services/api.ts#L27-L35)
- [web/src/App.tsx:10-26](file://web/src/App.tsx#L10-L26)

### Mobile Application Navigation and Screens
The mobile application uses React Navigation with a native stack:
- App root delegates to a navigator
- Navigator defines screens for locations, panorama, and free navigation
- Locations screen renders lists of locations and rooms, supports search and navigation to panorama

```mermaid
sequenceDiagram
participant App as "App Root"
participant Nav as "Navigator"
participant Loc as "LocationsScreen"
participant API as "Mobile API Client"
App->>Nav : Render NavigationContainer
Nav->>Loc : Render LocationsScreen
Loc->>API : Load locations/rooms
API-->>Loc : Locations data
Loc->>Nav : navigate("Panorama", {locationId,...})
```

**Diagram sources**
- [mobile/App.tsx:6-12](file://mobile/App.tsx#L6-L12)
- [mobile/src/navigation/AppNavigator.tsx:24-44](file://mobile/src/navigation/AppNavigator.tsx#L24-L44)
- [mobile/src/screens/LocationsScreen.tsx:21-56](file://mobile/src/screens/LocationsScreen.tsx#L21-L56)
- [mobile/src/services/api.ts](file://mobile/src/services/api.ts)

**Section sources**
- [mobile/App.tsx:6-12](file://mobile/App.tsx#L6-L12)
- [mobile/src/navigation/AppNavigator.tsx:24-44](file://mobile/src/navigation/AppNavigator.tsx#L24-L44)
- [mobile/src/screens/LocationsScreen.tsx:21-56](file://mobile/src/screens/LocationsScreen.tsx#L21-L56)

### Data Flow Patterns and State Management
- Web: React functional components with useState/useEffect orchestrate data fetching and UI updates; API client injects auth tokens and centralizes endpoint logic
- Mobile: React Native screens coordinate navigation and data loading; API client mirrors web’s interface
- Backend: Controllers return structured JSON responses; services encapsulate business rules; repositories abstract Supabase operations

```mermaid
flowchart TD
UI["UI Component"] --> Hook["useEffect/useCallback"]
Hook --> CallAPI["Call API Client"]
CallAPI --> Backend["Backend Endpoint"]
Backend --> Repo["Repository"]
Repo --> DB["Supabase"]
DB --> Repo
Repo --> Backend
Backend --> JSON["JSON Response"]
JSON --> Hook
Hook --> UpdateUI["Update State & Render"]
```

**Diagram sources**
- [web/src/pages/HomePage.tsx:12-39](file://web/src/pages/HomePage.tsx#L12-L39)
- [web/src/services/api.ts:1-332](file://web/src/services/api.ts#L1-L332)
- [backend/src/repositories/user.repository.ts:29-44](file://backend/src/repositories/user.repository.ts#L29-L44)

**Section sources**
- [web/src/pages/HomePage.tsx:12-39](file://web/src/pages/HomePage.tsx#L12-L39)
- [web/src/services/api.ts:1-332](file://web/src/services/api.ts#L1-L332)
- [backend/src/repositories/user.repository.ts:29-44](file://backend/src/repositories/user.repository.ts#L29-L44)

## Dependency Analysis
Key dependencies and relationships:
- Environment configuration drives JWT secrets, Supabase URLs, and CORS policy
- Auth middleware depends on JWT utilities for token verification
- Auth controller depends on auth service; auth service depends on user repository
- Web and mobile API clients depend on the backend endpoints and local storage for tokens
- Static asset serving for panorama images is configured in the backend app

```mermaid
graph LR
ENV["env.ts"] --> JWT["jwt.ts"]
ENV --> APP["app.ts"]
JWT --> AUTH_MW["auth.middleware.ts"]
AUTH_MW --> AUTH_CTRL["auth.controller.ts"]
AUTH_CTRL --> AUTH_SVC["auth.service.ts"]
AUTH_SVC --> USER_REPO["user.repository.ts"]
WEB_API["web/services/api.ts"] --> APP
MOB_API["mobile/services/api.ts"] --> APP
```

**Diagram sources**
- [backend/src/config/env.ts:1-33](file://backend/src/config/env.ts#L1-L33)
- [backend/src/utils/jwt.ts:1-53](file://backend/src/utils/jwt.ts#L1-L53)
- [backend/src/app.ts:1-71](file://backend/src/app.ts#L1-L71)
- [backend/src/middleware/auth.middleware.ts:1-52](file://backend/src/middleware/auth.middleware.ts#L1-L52)
- [backend/src/controllers/auth.controller.ts:1-53](file://backend/src/controllers/auth.controller.ts#L1-L53)
- [backend/src/services/auth.service.ts:1-87](file://backend/src/services/auth.service.ts#L1-L87)
- [backend/src/repositories/user.repository.ts:1-88](file://backend/src/repositories/user.repository.ts#L1-L88)
- [web/src/services/api.ts:1-332](file://web/src/services/api.ts#L1-L332)
- [mobile/src/services/api.ts](file://mobile/src/services/api.ts)

**Section sources**
- [backend/src/config/env.ts:1-33](file://backend/src/config/env.ts#L1-L33)
- [backend/src/utils/jwt.ts:1-53](file://backend/src/utils/jwt.ts#L1-L53)
- [backend/src/app.ts:1-71](file://backend/src/app.ts#L1-L71)
- [backend/src/middleware/auth.middleware.ts:1-52](file://backend/src/middleware/auth.middleware.ts#L1-L52)
- [backend/src/controllers/auth.controller.ts:1-53](file://backend/src/controllers/auth.controller.ts#L1-L53)
- [backend/src/services/auth.service.ts:1-87](file://backend/src/services/auth.service.ts#L1-L87)
- [backend/src/repositories/user.repository.ts:1-88](file://backend/src/repositories/user.repository.ts#L1-L88)
- [web/src/services/api.ts:1-332](file://web/src/services/api.ts#L1-L332)
- [mobile/src/services/api.ts](file://mobile/src/services/api.ts)

## Performance Considerations
- Rate limiting: The backend enforces a global rate limit to mitigate abuse
- Static asset caching: Panorama images are served with long cache headers to reduce bandwidth
- Payload sizes: Body parsing limits are configured to handle larger uploads
- Client-side caching: Consider implementing in-memory caching in clients for repeated queries
- Database queries: Ensure repository queries use appropriate selects and filters to minimize payload sizes

**Section sources**
- [backend/src/app.ts:46-53](file://backend/src/app.ts#L46-L53)
- [backend/src/app.ts:35-44](file://backend/src/app.ts#L35-L44)

## Troubleshooting Guide
- Health check: Verify backend availability via the /api/health endpoint
- Authentication errors: Ensure Authorization header is present and valid; confirm JWT secrets and expiration settings
- CORS issues: Confirm CORS_ORIGIN matches the client origin
- Supabase connectivity: Validate SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY; ensure database migrations are applied
- Client token handling: Confirm auth tokens are stored and injected by the API client

**Section sources**
- [backend/src/app.ts:55-60](file://backend/src/app.ts#L55-L60)
- [backend/src/middleware/auth.middleware.ts:19-39](file://backend/src/middleware/auth.middleware.ts#L19-L39)
- [backend/src/config/env.ts:6-20](file://backend/src/config/env.ts#L6-L20)
- [web/src/services/api.ts:13-23](file://web/src/services/api.ts#L13-L23)

## Conclusion
The Panorama system employs a clean, layered backend architecture with explicit separation of concerns, complemented by component-based frontends for web and mobile. RESTful APIs facilitate cross-platform communication, while JWT-based authentication secures access. Supabase integrates seamlessly for database and storage needs, and static asset delivery optimizes media performance. This design supports scalability, maintainability, and cross-platform consistency.