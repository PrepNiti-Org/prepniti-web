import { api } from "@/lib/api";
import { LoginCredentials, AuthResponse, RegisterCredentials } from "./types";

export const loginUser = async (data: LoginCredentials): Promise<AuthResponse> => {
    const res = await api.post("/auth/login", data);
    return res.data;
};

export const registerUser = async (data: RegisterCredentials): Promise<AuthResponse> => {
    const res = await api.post("/auth/register", data);
    return res.data;
};