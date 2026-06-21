import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { BACKEND_URL } from "@/lib/api";

export const useNotifications = () => {
    const { isLoggedIn, user } = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isLoggedIn) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        const eventSource = new EventSource(`${BACKEND_URL}/api/notifications/stream?token=${token}`);

        eventSource.onmessage = (event) => {
            const newNotification = JSON.parse(event.data);

            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        };

        eventSource.onerror = (error) => {
            console.error("SSE Error:", error);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [isLoggedIn, queryClient]);
};
