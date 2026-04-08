"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
async function bootstrap() {
    await (0, db_1.verifyDatabaseConnection)();
    app_1.default.listen(env_1.env.PORT, () => {
        // eslint-disable-next-line no-console
        console.log(`Backend API is running on http://localhost:${env_1.env.PORT}`);
    });
}
bootstrap().catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Failed to start backend server", error);
    process.exit(1);
});
