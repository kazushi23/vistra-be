import jwt, { SignOptions } from "jsonwebtoken";
import config from "../config/config.js";

export interface JwtPayload {
    id: number;
    email: string;
    name: string;
}

export const generateToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, config.jwt_secret, {expiresIn: config.jwt_expires_in})
}

export const verifyToken = (token: string): JwtPayload => {
    return jwt.verify(token, config.jwt_secret) as JwtPayload;
}