"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "production", "test"]).default("development"),
    PORT: zod_1.z
        .string()
        .default("5000")
        .transform((value) => Number(value)),
    JWT_ACCESS_SECRET: zod_1.z.string().min(1, "JWT_ACCESS_SECRET is required"),
    JWT_ACCESS_EXPIRES_IN: zod_1.z.string().default("15m"),
    JWT_REFRESH_SECRET: zod_1.z.string().min(1, "JWT_REFRESH_SECRET is required"),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default("7d"),
    SUPABASE_URL: zod_1.z.string().url("SUPABASE_URL must be a valid URL"),
    SUPABASE_SERVICE_ROLE_KEY: zod_1.z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
    SUPABASE_BUCKET: zod_1.z.string().default("panoramas"),
    CORS_ORIGIN: zod_1.z.string().default("*"),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    const issues = parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
    throw new Error(`Environment validation error: ${issues}`);
}
exports.env = parsed.data;
