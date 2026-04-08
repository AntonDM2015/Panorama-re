import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { loginUser, registerUser } from "../services/auth.service";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.enum(["student", "admin"]).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function registerController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = registerSchema.parse(req.body);
    const result = await registerUser(body);

    res.status(201).json({
      user: result.user,
      tokens: result.tokens,
    });
  } catch (error) {
    next(error);
  }
}

export async function loginController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = loginSchema.parse(req.body);
    const result = await loginUser(body);

    res.status(200).json({
      user: result.user,
      tokens: result.tokens,
    });
  } catch (error) {
    next(error);
  }
}

export async function meController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
}
