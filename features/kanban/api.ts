import { api } from "@/lib/api";

export type Status = "TODO" | "IN_PROGRESS" | "DONE";
export type Priority = "HIGH" | "MEDIUM" | "LOW";

export interface Task {
    id: string;
    created_at: string;
    title: string;
    description?: string;
    status: Status;
    priority: Priority;
    subject: string;
    type: string;
    estimated_hours?: number;
    target_date?: string;
}

export const getTasks = async (): Promise<Task[]> => {
    const res = await api.get("/tasks");
    return res.data.data;
};

export const createTask = async (data: Partial<Task>) => {
    const res = await api.post("/tasks", data);
    return res.data.data;
};

export const updateTask = async ({ id, data }: { id: string; data: Partial<Task> }) => {
    const res = await api.patch(`/tasks/${id}`, data);
    return res.data.data;
};

export const deleteTask = async (id: string) => {
    const res = await api.delete(`/tasks/${id}`);
    return res.data;
};

// --- Time Logs ---

export interface TimeLog {
    id: string;
    task_id: string;
    user_id: string;
    duration_minutes: number;
    note: string;
    logged_at: string;
    created_at: string;
}

export interface DailyEntry {
    date: string;
    minutes: number;
}

export const createTimeLog = async (taskId: string, data: { duration_minutes: number; note?: string; logged_at?: string }) => {
    const res = await api.post(`/tasks/${taskId}/timelogs`, data);
    return res.data.data;
};

export const getTaskTimeLogs = async (taskId: string): Promise<{ data: TimeLog[]; total_minutes: number }> => {
    const res = await api.get(`/tasks/${taskId}/timelogs`);
    return res.data;
};

export const getUserTimeLogs = async (from?: string, to?: string): Promise<{ data: TimeLog[]; daily: DailyEntry[]; total_minutes: number }> => {
    let url = "/timelogs";
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    if (params.toString()) url += `?${params.toString()}`;
    const res = await api.get(url);
    return res.data;
};

export const deleteTimeLog = async (id: string) => {
    const res = await api.delete(`/timelogs/${id}`);
    return res.data;
};

// --- Study Session API ---

export interface SessionResponseData {
    id: string;
    task_id: string;
    task_title: string;
    started_at: string;
    accumulated_seconds: number;
    is_paused: boolean;
    paused_at?: string;
    created_at: string;
}

export const getActiveSession = async (): Promise<SessionResponseData | null> => {
    try {
        const res = await api.get<{ data: SessionResponseData }>("/sessions/active");
        return res.data.data;
    } catch (err: any) {
        if (err?.response?.status === 404) {
            return null;
        }
        throw err;
    }
};

export const startSession = async (taskId: string): Promise<SessionResponseData> => {
    const res = await api.post<{ data: SessionResponseData }>("/sessions/start", { task_id: taskId });
    return res.data.data;
};

export const pauseSession = async (): Promise<SessionResponseData> => {
    const res = await api.post<{ data: SessionResponseData }>("/sessions/pause");
    return res.data.data;
};

export const resumeSession = async (): Promise<SessionResponseData> => {
    const res = await api.post<{ data: SessionResponseData }>("/sessions/resume");
    return res.data.data;
};

export const stopSession = async (note?: string): Promise<{ data: any; duration_minutes: number; elapsed_seconds: number }> => {
    const res = await api.post("/sessions/stop", { note });
    return res.data;
};

export const discardSession = async (): Promise<{ message: string }> => {
    const res = await api.delete("/sessions/active");
    return res.data;
};