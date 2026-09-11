import z from "zod";

const passwordSchema = z
    .string()
    .min(8)
    .max(64)
    .regex(/[A-Z]/, "Password must contain one uppercase letter.")
    .regex(/[a-z]/, "Password must contain one lowercase letter.")
    .regex(/[0-9]/, "Password must contain one number.")
    .regex(/[^A-Za-z0-9]/, "Password must contain one special character.");

export const registerUserSchema = z
    .object({
        name: z.string().trim().min(2, "Name must be at least 2 characters.").max(50),
        email: z.email("Invalid email address."),
        password: passwordSchema,
        organizationName: z.string().trim().min(2).max(100),
        timezone: z.string().trim().min(1),
    })
    .strict();

export const loginUserSchema = z
    .object({
        email: z.email(),
        password: z.string().min(8),
    })
    .strict();

export const verifyEmailSchema = z
    .object({
        token: z.string(),
    })
    .strict();

export const forgotPasswordSchema = z
    .object({
        email: z.email(),
    })
    .strict();

export const resetPasswordSchema = z
    .object({
        token: z.string(),
        password: passwordSchema, // newPassword
    })
    .strict();

export const changePasswordSchema = z
    .object({
        currentPassword: z.string(),
        newPassword: passwordSchema,
    })
    .strict();

export const refreshTokenSchema = z
    .object({
        refreshToken: z.string(),
    })
    .strict();

export const logoutUserSchema = z
    .object({
        refreshToken: z.string(),
    })
    .strict();

export type RegisterUserDTO = z.infer<typeof registerUserSchema>;
export type LoginUserDTO = z.infer<typeof loginUserSchema>;
export type VerifyEmailDTO = z.infer<typeof verifyEmailSchema>;
export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;
export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>;
export type LogoutUserDTO = z.infer<typeof logoutUserSchema>;