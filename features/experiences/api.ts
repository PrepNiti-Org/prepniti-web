import { api } from "@/lib/api";
import { CreateExperienceDTO } from "./types";

export interface Experience {
    id: number;
    exam_name: string;
    year: number;
    verdict: string;
    difficulty: string;
    description: string;
    is_anonymous: boolean;
    created_at: string;
    user: {
        username: string;
    };
}

interface GetExperiencesParams {
    pageParam?: number;
    sortBy?: "latest" | "top";
}

interface FetchExperiencesResponse {
    data: Experience[];
    nextPage: number | null;
}

export const getExperiences = async ({
    pageParam = 1,
    sortBy = "latest"
}: GetExperiencesParams): Promise<FetchExperiencesResponse> => {

    const res = await api.get(`/experiences?page=${pageParam}&limit=10&sort=${sortBy}`);

    return {
        data: res.data.data || [],
        nextPage: res.data.next_page || null,
    };
};

export const getExperienceById = async (id: string): Promise<Experience> => {
    const res = await api.get(`/experiences/${id}`);
    return res.data.data;
};

export const updateExperience = async ({ id, data }: { id: string, data: Partial<CreateExperienceDTO> }) => {
    const res = await api.patch(`/experiences/${id}`, data);
    return res.data;
};