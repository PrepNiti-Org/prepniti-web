export interface Experience {
    id: string;
    exam_name: string;
    year: number;
    verdict: "Selected" | "Rejected" | "Waitlist";
    difficulty: "Easy" | "Medium" | "Hard";
    description: string;
    is_anonymous: boolean;
    user_id: string;
    user?: {
        username: string;
    };
    like_count?: number;
    feed_score?: number;
    created_at: string;
}

export interface CreateExperienceDTO {
    exam_name: string;
    year: number;
    verdict: string;
    difficulty: string;
    description: string;
    is_anonymous?: boolean;
}