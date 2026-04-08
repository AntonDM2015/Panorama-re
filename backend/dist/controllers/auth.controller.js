"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerController = registerController;
exports.loginController = loginController;
exports.meController = meController;
const zod_1 = require("zod");
const auth_service_1 = require("../services/auth.service");
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).max(128),
    role: zod_1.z.enum(["student", "admin"]).optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).max(128),
});
async function registerController(req, res, next) {
    try {
        const body = registerSchema.parse(req.body);
        const result = await (0, auth_service_1.registerUser)(body);
        res.status(201).json({
            user: result.user,
            tokens: result.tokens,
        });
    }
    catch (error) {
        next(error);
    }
}
async function loginController(req, res, next) {
    try {
        const body = loginSchema.parse(req.body);
        const result = await (0, auth_service_1.loginUser)(body);
        res.status(200).json({
            user: result.user,
            tokens: result.tokens,
        });
    }
    catch (error) {
        next(error);
    }
}
async function meController(req, res, next) {
    try {
        res.status(200).json({
            user: req.user,
        });
    }
    catch (error) {
        next(error);
    }
}
