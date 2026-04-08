import "express";

declare global {
  namespace Express {
    interface UserPayload {
      userId: string;
      email: string;
      role: "student" | "admin";
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
