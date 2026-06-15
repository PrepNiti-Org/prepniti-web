"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";

interface User {
    username: string;
    email: string;
}

export function useAuth() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isHydrated, setIsHydrated] = useState(false);

    const router = useRouter();

    useEffect(() => {
        if (typeof window === "undefined") return;

        const token = Cookies.get("token");
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLoggedIn(!!token);

        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Failed to parse stored user:", error);
            }
        }

        setIsHydrated(true);
    }, []);

    const login = useCallback((token: string, userData: User) => {
        Cookies.set("token", token, {
            expires: 7,
            secure: window.location.protocol === 'https:'
        });
        localStorage.setItem("user", JSON.stringify(userData));
        setIsLoggedIn(true);
        setUser(userData);
    }, []);

    const logout = useCallback(() => {
        Cookies.remove("token");
        localStorage.removeItem("user");

        setIsLoggedIn(false);
        setUser(null);

        toast.info("Logged out");
        router.push("/login");
    }, [router]);

    return { isLoggedIn, user, login, logout, isHydrated };
}