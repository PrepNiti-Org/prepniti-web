import axios from 'axios';
import Cookies from "js-cookie";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

export const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api").replace(/\/api$/, "");

api.interceptors.request.use((config) => {
    const token = Cookies.get("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});