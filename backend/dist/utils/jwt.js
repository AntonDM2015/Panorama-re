"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.signRefreshToken = signRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function signToken(payload, secret, expiresIn) {
    const options = {
        expiresIn: expiresIn,
    };
    return jsonwebtoken_1.default.sign(payload, secret, options);
}
function signAccessToken(payload) {
    return signToken(payload, env_1.env.JWT_ACCESS_SECRET, env_1.env.JWT_ACCESS_EXPIRES_IN);
}
function signRefreshToken(payload) {
    return signToken(payload, env_1.env.JWT_REFRESH_SECRET, env_1.env.JWT_REFRESH_EXPIRES_IN);
}
function assertObjectPayload(decoded) {
    if (typeof decoded === "string") {
        throw new Error("Invalid token payload format");
    }
}
function verifyAccessToken(token) {
    const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET);
    assertObjectPayload(decoded);
    return {
        userId: String(decoded.userId),
        email: String(decoded.email),
        role: decoded.role === "admin" ? "admin" : "student",
    };
}
function verifyRefreshToken(token) {
    const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_REFRESH_SECRET);
    assertObjectPayload(decoded);
    return {
        userId: String(decoded.userId),
        email: String(decoded.email),
        role: decoded.role === "admin" ? "admin" : "student",
    };
}
