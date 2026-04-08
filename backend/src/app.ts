import cors from "cors";
import path from "path";
import fs from "fs";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes";
import cityRouter from "./routes/city.routes";
import buildingRouter from "./routes/building.routes";
import locationRouter from "./routes/location.routes";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Create uploads/panoramas directory if it doesn't exist
const panoramasPath = path.resolve(process.cwd(), "uploads/panoramas");
if (!fs.existsSync(panoramasPath)) {
  fs.mkdirSync(panoramasPath, { recursive: true });
  console.log(`Created panoramas directory: ${panoramasPath}`);
}

// Serve panorama images as static files (BEFORE routes)
// GET /panoramas/:filename - serves files from uploads/panoramas/
app.use("/panoramas", express.static(panoramasPath, {
  maxAge: "7d",
  cacheControl: true,
  setHeaders: (res, filePath) => {
    res.setHeader("Cache-Control", "public, max-age=604800");
    res.setHeader("Access-Control-Allow-Origin", "*");
  },
}));

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "campus-panorama-backend",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/cities", cityRouter);
app.use("/api/buildings", buildingRouter);
app.use("/api/locations", locationRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
