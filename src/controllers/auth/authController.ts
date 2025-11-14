import { NextFunction, Request, Response } from "express";
import { LoginSchema } from "../../schemas/auth.schema.js";
import RequestHandler from "../../utils/RequestHandler.js";
import { LoginResponse, SignupResponse } from "../../types/dto/user/user.js";
import { authservice } from "../../service/auth/authService.js";

export class AuthController {
    static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const parsedLogin = LoginSchema.safeParse(req.body)
            if (!parsedLogin.success) {
                const message = parsedLogin.error.issues[0]?.message || "Login fields invalid"
                return RequestHandler.sendError(res, message, 400)
            }
            const result: LoginResponse = await authservice.login(parsedLogin.data.email, parsedLogin.data.password);

            return RequestHandler.sendSuccess(res, result.message)(result.data)
        } catch(error) {
            next(error)
        }
    }

    static async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result: SignupResponse = await authservice.signup();

            return RequestHandler.sendSuccess(res, result.message)(result.data)
        } catch(error) {
            next(error)
        }
    }
}