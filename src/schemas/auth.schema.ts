import * as z from "zod";

export const LoginSchema = z.object({
    email: z.email({error: "Email is not valid"}),
    password: z.string() // need to include regex validation
})
