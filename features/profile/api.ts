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
    month: string;
    score: number;
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