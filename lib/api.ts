import axios from 'axios';
import Cookies from "js-cookie";
import { attachGuestInterceptor } from "@/features/guest/guestInterceptor";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// Pluggable Guest Mode Interceptor
attachGuestInterceptor(api);

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
const normalizedApiUrl = rawApiUrl.startsWith("http") ? rawApiUrl : `https://${rawApiUrl.replace(/^\/+/, "")}`;

export const BACKEND_URL = normalizedApiUrl.replace(/\/api\/?$/, "");

api.interceptors.request.use((config) => {
    let token = Cookies.get("token");
    if (!token && typeof window !== "undefined") {
        token = localStorage.getItem("token") || undefined;
    }
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});