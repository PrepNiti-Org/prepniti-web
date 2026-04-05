export interface Experience {
    id: number;
    exam_name: string;
    year: number;
    verdict: "Selected" | "Rejected" | "Waitlist";
    difficulty: "Easy" | "Medium" | "Hard";
    user_id: number;
}

export interface CreateExperienceDTO {
    exam_name: string;
    year: number;
    verdict: string;
    difficulty: string;
    description: string;
}