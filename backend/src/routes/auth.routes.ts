import { Router } from "express";
import { loginController, meController, registerController } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

const authRouter = Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.get("/me", requireAuth, meController);

export default authRouter;
