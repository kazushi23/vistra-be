import { BaseService } from "../baseService.js";
import { User } from "../../entity/User.js";
import { Repository } from "typeorm";
import { AppDataSource } from "../../data-source.js";
import { getUserDto, UserDto } from "../../types/dto/user/user.dto.js";
import { HttpError } from "../../types/httpError.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../../utils/jwt.js";
import RequestHandler from "../../utils/RequestHandler.js";
import { LoginResponse, SignupResponse } from "../../types/dto/user/user.js";

export class AuthService extends BaseService<User> {

    constructor() {
        const userRepository: Repository<User> = AppDataSource.getRepository(User);
        super(userRepository);
    }

    async login(email: string, password: string): Promise<LoginResponse> {
        const user: User | null = await this.repository.findOneBy({email: email})
        if (!user) {
            throw new HttpError("User not found", 404)
        }

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) {
            throw new HttpError("Password is invalid", 403)
        }

        const token = generateToken({id: user.id, email: user.email, name: user.name})
        return {
            success: true,
            message: "Login Successful",
            data: token,
        }
    } 

    async signup(): Promise<SignupResponse> {
        const user = new User();
        user.name = "kazushi";
        user.email = "kazushit8@gmail.com";
        user.password = await bcrypt.hash("Proteus@2025", 10);
        const res = await this.createOne(user)
        
        return {
            success: true,
            message: "Signup Successful",
            data: getUserDto(res),
        }
    } 
}

export const authservice = new AuthService();