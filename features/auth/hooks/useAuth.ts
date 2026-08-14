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

    const login = useCallback((tokenOrUser: string | User, userData?: User) => {
        let finalUser: User | undefined;
        if (typeof tokenOrUser === "string") {
            finalUser = userData;
        } else {
            finalUser = tokenOrUser;
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
        // Cookies.remove("token", {
        //     path: '/',
        //     secure: window.location.protocol === 'https:'
        // });
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setIsLoggedIn(false);
        setUser(null);

        toast.info("Logged out");
        router.push("/login");
    }, [router]);

    return { isLoggedIn, user, login, logout, isHydrated };
}