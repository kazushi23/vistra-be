import type { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config/config.js";
import { AppDataSource } from "../data-source.js";
import { User } from "../entity/User.js";
import { HttpError } from "../types/httpError.js";
import { verifyToken } from "../utils/jwt.js";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: Missing token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded: JwtPayload = verifyToken(token!);
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({where: {id: parseInt(decoded.id)}})

    if (!user) {
      throw new HttpError("Unauthorised user", 401)
    }

    req.user = user; // attach user info to request
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
