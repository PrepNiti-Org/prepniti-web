import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { BACKEND_URL } from "@/lib/api";

export const useNotifications = () => {
    const { isLoggedIn } = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isLoggedIn) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        const eventSource = new EventSource(`${BACKEND_URL}/api/notifications/stream?token=${token}`);

        eventSource.onmessage = (event) => {
            try {
                const newNotification = JSON.parse(event.data);

                queryClient.invalidateQueries({ queryKey: ["notifications"] });
                queryClient.invalidateQueries({ queryKey: ["notificationsList"] });


                if (newNotification?.type === "buddy_request") {
                    queryClient.invalidateQueries({ queryKey: ["buddy-requests"] });
                }

                if (newNotification?.type === "buddy_accepted") {
                    queryClient.invalidateQueries({ queryKey: ["buddies"] });
                    queryClient.invalidateQueries({ queryKey: ["buddy-requests"] });
                }
            } catch {
            }
        };

        eventSource.onerror = () => {
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [isLoggedIn, queryClient]);
};
