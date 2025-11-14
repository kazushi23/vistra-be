import { User } from "../../../entity/User.js";


export interface UserDto {
    id: number;
    email: string;
    name: string;
}

export function getUserDto(user: User): UserDto {
    return {
        id: user.id,
        email: user.email,
        name: user.name
    }
}