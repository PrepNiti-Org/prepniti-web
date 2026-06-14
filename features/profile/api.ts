import { api } from "@/lib/api";

export interface UserProfile {
    id: number;
    username: string;
    email: string;
    bio?: string;
    target_exam?: string;
    joined_at: string;
    role: string;
}

export interface PerformanceStat {
    id: string;
    exam_name: string;
    score: number;
    max_score: number;
    percentage: number;
    month: string;
    attempted_at: string;
}

export interface UpdateProfileDTO {
    username: string;
    bio: string;
    target_exam: string;
}

export interface ActivityData {
    streak: number;
    contributions: {
        id: number;
        title: string;
        details: string;
    }[];
}

export interface UserExperience {
    id: number;
    exam_name: string;
    year: number;
    verdict: string;
    difficulty: string;
    description: string;
    created_at: string;
}

export const getUserProfile = async (): Promise<UserProfile> => {
    const res = await api.get("/users/me");
    return res.data.data || res.data;
};

export const getUserStats = async (): Promise<PerformanceStat[]> => {
    const res = await api.get("/users/me/stats");
    const chartData = res.data?.data;
    return Array.isArray(chartData) ? chartData : [];
};

export const updateUserProfile = async (data: UpdateProfileDTO) => {
    const res = await api.patch("/users/me", data);
    return res.data;
};

export const getUserActivity = async (): Promise<ActivityData> => {
    const res = await api.get("/users/me/activity");
    return res.data.data;
};

export const getUserExperiences = async (): Promise<UserExperience[]> => {
    const res = await api.get("/experiences/me");
    return res.data.data || [];
};

export interface MockTestTrendEntry {
    exam_name: string;
    percentage: number;
    score: number;
    max_score: number;
    attempted_at: string;
}

export interface MockTestPerPaper {
    exam_name: string;
    attempts: number;
    best_pct: number;
    avg_pct: number;
    last_attempted_at: string;
}

export interface MockTestInsights {
    total_attempts: number;
    avg_score_pct: number;
    best_score_pct: number;
    total_papers_attempted: number;
    recent_trend: MockTestTrendEntry[];
    per_paper: MockTestPerPaper[];
}

export const getMockTestInsights = async (): Promise<MockTestInsights> => {
    const res = await api.get("/users/me/stats/insights");
    return res.data;
};