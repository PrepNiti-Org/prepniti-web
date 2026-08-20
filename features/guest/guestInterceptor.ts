import { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { ENABLE_GUEST_MODE, GUEST_USER } from "./config";
import {
    isGuestActive,
    getGuestTasks,
    createGuestTask,
    updateGuestTask,
    deleteGuestTask,
    getGuestTimeLogs,
    createGuestTimeLog,
    deleteGuestTimeLog,
    getGuestBookmarks,
    toggleGuestBookmark,
    getGuestPosts,
    createGuestPost,
    getGuestExperiences,
    createGuestExperience,
    getGuestPapers,
    getGuestPaperQuestions,
    getGuestInsights,
} from "./guestStorage";
import { MOCK_TOUR_RECS } from "@/features/tour/tourMockData";

export function attachGuestInterceptor(axiosInstance: AxiosInstance) {
    if (!ENABLE_GUEST_MODE) return;

    axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
        if (!isGuestActive()) return config;

        const method = config.method?.toLowerCase() || "get";
        const url = config.url || "";

        // Mock resolver helper
        const mockResponse = (data: any, status = 200) => {
            config.adapter = async () => ({
                data,
                status,
                statusText: "OK",
                headers: {},
                config,
            });
        };

        // --- Current User Profile ---
        if (url === "/users/me" && method === "get") {
            mockResponse({ data: GUEST_USER });
            return config;
        }

        // --- Performance & Mock Test Insights ---
        if (url === "/users/me/stats/insights" && method === "get") {
            mockResponse(getGuestInsights());
            return config;
        }
        if (url === "/users/me/stats" && method === "get") {
            mockResponse({ data: getGuestInsights().recent_trend });
            return config;
        }
        if (url === "/users/me/activity" && method === "get") {
            mockResponse({ data: { streak: 5, contributions: [] } });
            return config;
        }

        // --- Mock Test Papers & Questions ---
        if (url === "/papers" && method === "get") {
            mockResponse(getGuestPapers());
            return config;
        }

        const paperQuestionsMatch = url.match(/^\/papers\/([^/]+)\/questions$/);
        if (paperQuestionsMatch && method === "get") {
            mockResponse(getGuestPaperQuestions(paperQuestionsMatch[1]));
            return config;
        }

        // --- Posts Endpoints ---
        if (url.startsWith("/posts") && !url.includes("bookmark") && !url.includes("like") && !url.includes("comments")) {
            if (url === "/posts" || url.startsWith("/posts?")) {
                if (method === "get") {
                    mockResponse({ data: getGuestPosts(), next_page: null });
                } else if (method === "post") {
                    const body = typeof config.data === "string" ? JSON.parse(config.data || "{}") : config.data;
                    mockResponse({ data: createGuestPost(body) });
                }
                return config;
            }

            const singlePostMatch = url.match(/^\/posts\/([^/?]+)$/);
            if (singlePostMatch && method === "get") {
                const postId = singlePostMatch[1];
                const post = getGuestPosts().find((p: any) => p.id === postId) || getGuestPosts()[0];
                mockResponse({ data: post });
                return config;
            }
        }

        // --- Experiences Endpoints ---
        if (url.startsWith("/experiences")) {
            if (method === "get") {
                mockResponse({ data: getGuestExperiences() });
            } else if (method === "post") {
                const body = typeof config.data === "string" ? JSON.parse(config.data || "{}") : config.data;
                mockResponse({ data: createGuestExperience(body) });
            }
            return config;
        }

        // --- Tasks Endpoints ---
        if (url === "/tasks") {
            if (method === "get") {
                mockResponse({ data: getGuestTasks() });
            } else if (method === "post") {
                const body = typeof config.data === "string" ? JSON.parse(config.data || "{}") : config.data;
                mockResponse({ data: createGuestTask(body) });
            }
            return config;
        }

        const taskMatch = url.match(/^\/tasks\/([^/]+)$/);
        if (taskMatch) {
            const taskId = taskMatch[1];
            if (method === "patch") {
                const body = typeof config.data === "string" ? JSON.parse(config.data || "{}") : config.data;
                mockResponse({ data: updateGuestTask(taskId, body) });
            } else if (method === "delete") {
                mockResponse(deleteGuestTask(taskId));
            }
            return config;
        }

        // --- Time Logs Endpoints ---
        const taskTimelogsMatch = url.match(/^\/tasks\/([^/]+)\/timelogs$/);
        if (taskTimelogsMatch) {
            const taskId = taskTimelogsMatch[1];
            if (method === "get") {
                const logs = getGuestTimeLogs().filter((l: any) => l.task_id === taskId);
                const total_minutes = logs.reduce((acc: number, l: any) => acc + (l.duration_minutes || 0), 0);
                mockResponse({ data: logs, total_minutes });
            } else if (method === "post") {
                const body = typeof config.data === "string" ? JSON.parse(config.data || "{}") : config.data;
                mockResponse({ data: createGuestTimeLog(taskId, body) });
            }
            return config;
        }

        if (url.startsWith("/timelogs")) {
            if (method === "get") {
                const logs = getGuestTimeLogs();
                const total_minutes = logs.reduce((acc: number, l: any) => acc + (l.duration_minutes || 0), 0);
                mockResponse({ data: logs, daily: [], total_minutes });
            }
            return config;
        }

        const deleteTimelogMatch = url.match(/^\/timelogs\/([^/]+)$/);
        if (deleteTimelogMatch && method === "delete") {
            mockResponse(deleteGuestTimeLog(deleteTimelogMatch[1]));
            return config;
        }

        // --- Bookmarks Endpoints ---
        if (url === "/bookmarks" && method === "get") {
            mockResponse({ data: getGuestBookmarks() });
            return config;
        }

        const bookmarkMatch = url.match(/^\/posts\/([^/]+)\/bookmark$/);
        if (bookmarkMatch && method === "post") {
            mockResponse(toggleGuestBookmark(bookmarkMatch[1]));
            return config;
        }

        // --- Buddy Portal & Social Defaults for Guest ---
        if (url === "/buddies" && method === "get") {
            mockResponse({ data: [] });
            return config;
        }
        if (url === "/buddies/requests" && method === "get") {
            mockResponse({ data: { incoming: [], outgoing: [] } });
            return config;
        }
        if (url === "/buddies/recommendations" && method === "get") {
            mockResponse({ data: MOCK_TOUR_RECS });
            return config;
        }
        if (url === "/my-pacts" && method === "get") {
            mockResponse({ data: [] });
            return config;
        }

        return config;
    });
}
