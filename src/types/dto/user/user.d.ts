import { CreateSingleDataResponse } from "../../base.js";
import { UserDto } from "./user.dto.ts";

export type LoginResponse = CreateSingleDataResponse<string>
export type SignupResponse = CreateSingleDataResponse<UserDto>