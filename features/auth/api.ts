import { api } from "@/lib/api";
import { LoginCredentials, AuthResponse, RegisterCredentials, ForgotPasswordCredentials, ResetPasswordCredentials } from "./types";

export const loginUser = async (data: LoginCredentials): Promise<AuthResponse> => {
    const res = await api.post("/auth/login", data);
    return res.data;
};

export const registerUser = async (data: RegisterCredentials): Promise<AuthResponse> => {
    const res = await api.post("/auth/register", data);
    return res.data;
};

export const forgotPassword = async (data: ForgotPasswordCredentials): Promise<{ message: string }> => {
    const res = await api.post("/auth/forgot-password", data);
    return res.data;
};

export const resetPassword = async (data: ResetPasswordCredentials): Promise<{ message: string }> => {
    const res = await api.post("/auth/reset-password", data);
    return res.data;
};