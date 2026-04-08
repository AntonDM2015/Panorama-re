"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyDatabaseConnection = verifyDatabaseConnection;
const http_errors_1 = __importDefault(require("http-errors"));
const supabase_1 = require("./supabase");
async function verifyDatabaseConnection() {
    const { error } = await supabase_1.supabaseAdmin.from("locations").select("id").limit(1);
    if (error && error.code !== "PGRST116") {
        throw (0, http_errors_1.default)(500, `Supabase connection check failed: ${error.message}`);
    }
}
