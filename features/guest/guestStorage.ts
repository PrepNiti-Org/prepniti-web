import { ENABLE_GUEST_MODE, GUEST_USER, GUEST_TOKEN } from "./config";
import { MOCK_TOUR_TASKS, MOCK_TOUR_TIME_LOGS } from "@/features/tour/tourMockData";
import {
    MOCK_GUEST_POSTS,
    MOCK_GUEST_EXPERIENCES,
    MOCK_GUEST_PAPERS,
    MOCK_GUEST_QUESTIONS_MAP,
    MOCK_GUEST_INSIGHTS,
} from "./guestMockData";
import Cookies from "js-cookie";

const STORAGE_KEYS = {
    USER: "user",
    TOKEN: "token",
    TASKS: "prepniti_guest_tasks",
    TIMELOGS: "prepniti_guest_timelogs",
    MOCK_STATS: "prepniti_guest_mock_stats",
    BOOKMARKS: "prepniti_guest_bookmarks",
    POSTS: "prepniti_guest_posts",
    EXPERIENCES: "prepniti_guest_experiences",
};

export function isGuestActive(): boolean {
    if (!ENABLE_GUEST_MODE || typeof window === "undefined") return false;
    try {
        const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || "{}");
        return user?.role === "guest";
    } catch {
        return false;
    }
}

export function activateGuestSession() {
    if (!ENABLE_GUEST_MODE || typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(GUEST_USER));
    localStorage.setItem(STORAGE_KEYS.TOKEN, GUEST_TOKEN);
    Cookies.set("token", GUEST_TOKEN, { expires: 7, path: "/" });

    // Seed initial guest data if empty
    if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(MOCK_TOUR_TASKS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TIMELOGS)) {
        localStorage.setItem(STORAGE_KEYS.TIMELOGS, JSON.stringify(MOCK_TOUR_TIME_LOGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(MOCK_GUEST_POSTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXPERIENCES)) {
        localStorage.setItem(STORAGE_KEYS.EXPERIENCES, JSON.stringify(MOCK_GUEST_EXPERIENCES));
    }
}

export function clearGuestSession() {
    if (typeof window === "undefined") return;
    Cookies.remove("token", { path: "/" });
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.TIMELOGS);
    localStorage.removeItem(STORAGE_KEYS.MOCK_STATS);
    localStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
    localStorage.removeItem(STORAGE_KEYS.POSTS);
    localStorage.removeItem(STORAGE_KEYS.EXPERIENCES);
}

// --- Tasks CRUD ---

export function getGuestTasks() {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
        return stored ? JSON.parse(stored) : MOCK_TOUR_TASKS;
    } catch {
        return MOCK_TOUR_TASKS;
    }
}

export function createGuestTask(data: any) {
    const tasks = getGuestTasks();
    const newTask = {
        id: `guest-task-${Date.now()}`,
        created_at: new Date().toISOString(),
        title: data.title || "Untitled Task",
        description: data.description || "",
        status: data.status || "TODO",
        priority: data.priority || "MEDIUM",
        subject: data.subject || "General",
        type: data.type || "STUDY",
        estimated_hours: data.estimated_hours || 1,
        target_date: data.target_date,
    };
    tasks.unshift(newTask);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    return newTask;
}

export function updateGuestTask(id: string, data: any) {
    const tasks = getGuestTasks();
    const idx = tasks.findIndex((t: any) => t.id === id);
    if (idx !== -1) {
        tasks[idx] = { ...tasks[idx], ...data };
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
        return tasks[idx];
    }
    return null;
}

export function deleteGuestTask(id: string) {
    const tasks = getGuestTasks();
    const filtered = tasks.filter((t: any) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(filtered));
    return { message: "Task deleted" };
}

// --- Time Logs CRUD ---

export function getGuestTimeLogs() {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.TIMELOGS);
        return stored ? JSON.parse(stored) : MOCK_TOUR_TIME_LOGS;
    } catch {
        return MOCK_TOUR_TIME_LOGS;
    }
}

export function createGuestTimeLog(taskId: string, data: any) {
    const logs = getGuestTimeLogs();
    const newLog = {
        id: `guest-log-${Date.now()}`,
        task_id: taskId,
        user_id: GUEST_USER.id,
        duration_minutes: data.duration_minutes || 0,
        note: data.note || "",
        logged_at: data.logged_at || new Date().toISOString(),
        created_at: new Date().toISOString(),
    };
    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEYS.TIMELOGS, JSON.stringify(logs));
    return newLog;
}

export function deleteGuestTimeLog(id: string) {
    const logs = getGuestTimeLogs();
    const filtered = logs.filter((l: any) => l.id !== id);
    localStorage.setItem(STORAGE_KEYS.TIMELOGS, JSON.stringify(filtered));
    return { message: "Time log deleted" };
}

// --- Bookmarks CRUD ---

export function getGuestBookmarks(): string[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

export function toggleGuestBookmark(postId: string) {
    const bookmarks = getGuestBookmarks();
    const exists = bookmarks.includes(postId);
    const updated = exists ? bookmarks.filter((id) => id !== postId) : [...bookmarks, postId];
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
    return { message: exists ? "Removed from bookmarks" : "Bookmarked", bookmarked: !exists };
}

// --- Posts CRUD ---

export function getGuestPosts() {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.POSTS);
        return stored ? JSON.parse(stored) : MOCK_GUEST_POSTS;
    } catch {
        return MOCK_GUEST_POSTS;
    }
}

export function createGuestPost(data: any) {
    const posts = getGuestPosts();
    const newPost = {
        id: `guest-post-${Date.now()}`,
        title: data.title,
        content: data.content,
        tags: data.tags || [],
        upvotes: 1,
        comment_count: 0,
        like_count: 1,
        bookmark_count: 0,
        created_at: new Date().toISOString(),
        user: { username: GUEST_USER.username },
    };
    posts.unshift(newPost);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return newPost;
}

// --- Experiences CRUD ---

export function getGuestExperiences() {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.EXPERIENCES);
        return stored ? JSON.parse(stored) : MOCK_GUEST_EXPERIENCES;
    } catch {
        return MOCK_GUEST_EXPERIENCES;
    }
}

export function createGuestExperience(data: any) {
    const experiences = getGuestExperiences();
    const newExp = {
        id: `guest-exp-${Date.now()}`,
        exam_name: data.exam_name,
        year: data.year || 2025,
        verdict: data.verdict || "Appeared",
        difficulty: data.difficulty || "Moderate",
        description: data.description || "",
        is_anonymous: data.is_anonymous || false,
        created_at: new Date().toISOString(),
        user_id: GUEST_USER.id,
    };
    experiences.unshift(newExp);
    localStorage.setItem(STORAGE_KEYS.EXPERIENCES, JSON.stringify(experiences));
    return newExp;
}

// --- Mock Test Papers & Questions ---

export function getGuestPapers() {
    return MOCK_GUEST_PAPERS;
}

export function getGuestPaperQuestions(paperId: string) {
    return MOCK_GUEST_QUESTIONS_MAP[paperId] || MOCK_GUEST_QUESTIONS_MAP["guest-paper-1"];
}

export function getGuestInsights() {
    return MOCK_GUEST_INSIGHTS;
}

