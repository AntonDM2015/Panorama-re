"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const http_errors_1 = __importDefault(require("http-errors"));
const user_repository_1 = require("../repositories/user.repository");
const jwt_1 = require("../utils/jwt");
function mapAuthUser(user) {
    return {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
    };
}
function buildTokens(user) {
    const payload = {
        userId: user.id,
        email: user.email,
        role: user.role,
    };
    return {
        accessToken: (0, jwt_1.signAccessToken)(payload),
        refreshToken: (0, jwt_1.signRefreshToken)(payload),
    };
}
async function registerUser(params) {
    const normalizedEmail = params.email.trim().toLowerCase();
    const existingUser = await (0, user_repository_1.findUserByEmail)(normalizedEmail);
    if (existingUser) {
        throw (0, http_errors_1.default)(409, "User with this email already exists");
    }
    const passwordHash = await bcryptjs_1.default.hash(params.password, 12);
    const user = await (0, user_repository_1.createUser)({
        email: normalizedEmail,
        passwordHash,
        role: params.role ?? "student",
    });
    return {
        user: mapAuthUser(user),
        tokens: buildTokens(user),
    };
}
async function loginUser(params) {
    const normalizedEmail = params.email.trim().toLowerCase();
    const user = await (0, user_repository_1.findUserByEmail)(normalizedEmail);
    if (!user) {
        throw (0, http_errors_1.default)(401, "Invalid email or password");
    }
    const isPasswordValid = await bcryptjs_1.default.compare(params.password, user.passwordHash);
    if (!isPasswordValid) {
        throw (0, http_errors_1.default)(401, "Invalid email or password");
    }
    return {
        user: mapAuthUser(user),
        tokens: buildTokens(user),
    };
}
