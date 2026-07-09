import { api } from "@/lib/api";
import { CreateExperienceDTO } from "./types";

export interface Experience {
    id: string;
    exam_name: string;
    year: number;
    verdict: string;
    difficulty: string;
    description: string;
    is_anonymous: boolean;
    created_at: string;
    user_id: string;
    user?: {
        username: string;
    };
    like_count?: number;
    feed_score?: number;
}

export interface GetExperiencesParams {
    pageParam?: number;
    sort?: "feed" | "newest" | "popular";
    examName?: string;
    verdict?: string;
    difficulty?: string;
    year?: string;
    search?: string;
}

interface FetchExperiencesResponse {
    data: Experience[];
    nextPage: number | null;
}

export const getExperiences = async ({
    pageParam = 1,
    sort = "feed",
    examName,
    verdict,
    difficulty,
    year,
    search,
}: GetExperiencesParams): Promise<FetchExperiencesResponse> => {
    let url = `/experiences?page=${pageParam}&limit=10&sort=${sort}`;
    if (examName) url += `&exam_name=${encodeURIComponent(examName)}`;
    if (verdict) url += `&verdict=${encodeURIComponent(verdict)}`;
    if (difficulty) url += `&difficulty=${encodeURIComponent(difficulty)}`;
    if (year) url += `&year=${encodeURIComponent(year)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const res = await api.get(url);
    return {
        data: res.data.data || [],
        nextPage: res.data.next_page || null,
    };
};

export const getExperienceById = async (id: string): Promise<Experience> => {
    const res = await api.get(`/experiences/${id}`);
    return res.data.data;
};

export const updateExperience = async ({ id, data }: { id: string; data: Partial<CreateExperienceDTO> }) => {
    const res = await api.patch(`/experiences/${id}`, data);
    return res.data;
};

export const toggleExperienceLike = async (
    id: string
): Promise<{ message: string; liked: boolean; like_count: number }> => {
    const res = await api.post(`/experiences/${id}/like`);
    return res.data;
};