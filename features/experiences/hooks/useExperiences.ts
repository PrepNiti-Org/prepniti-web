import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Experience, CreateExperienceDTO } from "../types";

const fetchExperiences = async (): Promise<Experience[]> => {
    const { data } = await api.get("/experiences");
    return data.data;
};

export const useExperiences = () => {
    return useQuery({
        queryKey: ["experiences"],
        queryFn: fetchExperiences,
    });
};

export const useCreateExperience = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newExp: CreateExperienceDTO) => {
            return await api.post("/experiences", newExp);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["experiences"] });
        },
    });
};