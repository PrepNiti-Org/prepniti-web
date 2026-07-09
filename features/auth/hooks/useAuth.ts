"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface User {
    id?: string | number;
    username: string;
    email: string;
    target_exam?: string;
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

    const login = useCallback((token: string, userData: User) => {
        // Fallback for non-HttpOnly context or API references
        Cookies.set("token", token, {
            expires: 7,
            secure: window.location.protocol === 'https:'
        });
        localStorage.setItem("user", JSON.stringify(userData));
        setIsLoggedIn(true);
        setUser(userData);
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post("/auth/logout");
        } catch (err) {
            console.error("Logout request failed:", err);
        }
        Cookies.remove("token");
        localStorage.removeItem("user");

        setIsLoggedIn(false);
        setUser(null);

        toast.info("Logged out");
        router.push("/login");
    }, [router]);

    return { isLoggedIn, user, login, logout, isHydrated };
}