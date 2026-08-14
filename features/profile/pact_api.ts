import { api } from "@/lib/api";

export interface PactProgressEntry {
    user_id: string;
    username: string;
    today_mins: number;
    goal_mins: number;
    days_passed: number;
    days_total: number;
    days_completed: number;
}

export interface StudyPact {
    id: string;
    status: "active" | "completed" | "cancelled" | "broken_by_initiator" | "broken_by_partner";
    duration_days: number;
    daily_goal_mins: number;
    start_date: string;
    created_at: string;
    initiator: PactProgressEntry;
    partner: PactProgressEntry;
}

export interface CreatePactInput {
    partner_username: string;
    duration_days: number;
    daily_goal_mins: number;
}

export const createPact = async (input: CreatePactInput): Promise<StudyPact> => {
    const res = await api.post("/pacts", input);
    return res.data.data;
};

export const getMyPacts = async (): Promise<StudyPact[]> => {
    const res = await api.get("/pacts");
    return res.data.data || [];
};

export const cancelPact = async (pactId: string): Promise<{ message: string }> => {
    const res = await api.delete(`/pacts/${pactId}`);
    return res.data;
};
