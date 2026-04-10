"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
const http_errors_1 = __importDefault(require("http-errors"));
const zod_1 = require("zod");
function notFoundHandler(_req, _res, next) {
    next((0, http_errors_1.default)(404, "Route not found"));
}
function errorHandler(error, _req, res, _next) {
    // Log actual error for debugging
    console.error('[ERROR HANDLER]', error);
    if (error instanceof zod_1.ZodError) {
        res.status(400).json({
            message: "Validation failed",
            details: error.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message,
            })),
        });
        return;
    }
    const status = error.status ?? 500;
    const message = status >= 500 ? "Internal server error" : error.message;
    res.status(status).json({
        message,
        ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
}
