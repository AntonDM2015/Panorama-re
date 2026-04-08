"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByEmail = findUserByEmail;
exports.findUserById = findUserById;
exports.createUser = createUser;
const http_errors_1 = __importDefault(require("http-errors"));
const supabase_1 = require("../config/supabase");
function mapUserRow(row) {
    return {
        id: row.id,
        email: row.email,
        passwordHash: row.password_hash,
        role: row.role,
        createdAt: new Date(),
    };
}
async function findUserByEmail(email) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("users")
        .select("id, email, password_hash, role")
        .eq("email", email)
        .maybeSingle();
    if (error) {
        throw (0, http_errors_1.default)(500, `Failed to fetch user by email: ${error.message}`);
    }
    if (!data) {
        return null;
    }
    return mapUserRow(data);
}
async function findUserById(userId) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("users")
        .select("id, email, password_hash, role")
        .eq("id", userId)
        .maybeSingle();
    if (error) {
        throw (0, http_errors_1.default)(500, `Failed to fetch user by id: ${error.message}`);
    }
    if (!data) {
        return null;
    }
    return mapUserRow(data);
}
async function createUser(params) {
    const role = params.role ?? "student";
    const { data, error } = await supabase_1.supabaseAdmin
        .from("users")
        .insert({
        email: params.email,
        password_hash: params.passwordHash,
        role,
    })
        .select("id, email, password_hash, role")
        .single();
    if (error) {
        throw (0, http_errors_1.default)(500, `Failed to create user: ${error.message}`);
    }
    return mapUserRow(data);
}
