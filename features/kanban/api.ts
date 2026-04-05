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