"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const city_routes_1 = __importDefault(require("./routes/city.routes"));
const building_routes_1 = __importDefault(require("./routes/building.routes"));
const location_routes_1 = __importDefault(require("./routes/location.routes"));
const env_1 = require("./config/env");
const error_middleware_1 = require("./middleware/error.middleware");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: env_1.env.CORS_ORIGIN === "*" ? true : env_1.env.CORS_ORIGIN,
    credentials: true,
}));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Create uploads/panoramas directory if it doesn't exist
const panoramasPath = path_1.default.resolve(process.cwd(), "uploads/panoramas");
if (!fs_1.default.existsSync(panoramasPath)) {
    fs_1.default.mkdirSync(panoramasPath, { recursive: true });
    console.log(`Created panoramas directory: ${panoramasPath}`);
}
// Serve panorama images as static files (BEFORE routes)
// GET /panoramas/:filename - serves files from uploads/panoramas/
app.use("/panoramas", express_1.default.static(panoramasPath, {
    maxAge: "7d",
    cacheControl: true,
    setHeaders: (res, filePath) => {
        res.setHeader("Cache-Control", "public, max-age=604800");
        res.setHeader("Access-Control-Allow-Origin", "*");
    },
}));
app.use((0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
}));
app.get("/api/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        service: "campus-panorama-backend",
    });
});
app.use("/api/auth", auth_routes_1.default);
app.use("/api/cities", city_routes_1.default);
app.use("/api/buildings", building_routes_1.default);
app.use("/api/locations", location_routes_1.default);
app.use(error_middleware_1.notFoundHandler);
app.use(error_middleware_1.errorHandler);
exports.default = app;
