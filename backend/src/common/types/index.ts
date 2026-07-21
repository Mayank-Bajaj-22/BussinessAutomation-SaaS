import { DataTypeMap } from "node:ffi";

export type ApiResponse<T> = {
    success: boolean;
    message: string;
    data?: T;
};

export interface IJwtPayload {
    userId: string;
    organizationId: string;
    membershipRole: string;
    email: string;
    isEmailVerified: boolean;
}