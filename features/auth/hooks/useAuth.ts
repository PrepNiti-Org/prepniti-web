"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { api } from "@/lib/api";

export interface User {
    id?: string | number;
    username: string;
    email: string;
    role?: string;
    target_exam?: string;
    target_exam_name?: string;
    target_exam_date?: string;
    bio?: string;
    pincode?: string;
    district?: string;
    state?: string;
    is_public?: boolean;
}

export function useAuth() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isHydrated, setIsHydrated] = useState(false);

    const router = useRouter();

    useEffect(() => {
        if (typeof window === "undefined") return;

        const checkAuth = async () => {
            try {
                const res = await api.get("/users/me");
                const userData = res.data.data;

                setUser(userData);
                setIsLoggedIn(true);
                localStorage.setItem("user", JSON.stringify(userData));
            } catch (err) {
                setUser(null);
                setIsLoggedIn(false);
                localStorage.removeItem("user");
            } finally {
                setIsHydrated(true);
            }
        };

        checkAuth();
    }, []);

    const login = useCallback((tokenOrUser?: string | User | null, userData?: User) => {
        let finalUser: User | undefined;
        let token: string | undefined;
        if (typeof tokenOrUser === "string") {
            token = tokenOrUser;
            finalUser = userData;
        } else if (tokenOrUser) {
            finalUser = tokenOrUser;
        }

        if (token) {
            localStorage.setItem("token", token);
            Cookies.set("token", token, { expires: 7, path: "/" });
        }

        if (finalUser) {
            localStorage.setItem("user", JSON.stringify(finalUser));
            setIsLoggedIn(true);
            setUser(finalUser);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post("/auth/logout");
        } catch (err) {
            console.error("Logout request failed:", err);
        }
        Cookies.remove("token", { path: "/" });
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("prepniti_guest_tasks");
        localStorage.removeItem("prepniti_guest_timelogs");
        localStorage.removeItem("prepniti_guest_bookmarks");
        localStorage.removeItem("prepniti_guest_mock_stats");

        setIsLoggedIn(false);
        setUser(null);

        toast.info("Logged out");
        router.push("/login");
    }, [router]);

    return { isLoggedIn, user, login, logout, isHydrated };
}