"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireAdmin = requireAdmin;
const http_errors_1 = __importDefault(require("http-errors"));
const jwt_1 = require("../utils/jwt");
function extractBearerToken(authorizationHeader) {
    if (!authorizationHeader) {
        return null;
    }
    const [scheme, token] = authorizationHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
        return null;
    }
    return token;
}
function requireAuth(req, _res, next) {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) {
        throw (0, http_errors_1.default)(401, "Authorization token is required");
    }
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        req.user = {
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
        };
        next();
    }
    catch (error) {
        throw (0, http_errors_1.default)(401, "Invalid or expired access token", { cause: error });
    }
}
function requireAdmin(req, _res, next) {
    if (!req.user) {
        throw (0, http_errors_1.default)(401, "Unauthorized");
    }
    if (req.user.role !== "admin") {
        throw (0, http_errors_1.default)(403, "Admin permissions required");
    }
    next();
}
