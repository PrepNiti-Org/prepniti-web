export interface Option {
    id: string;
    option_text: string;
    is_correct: boolean;
}

export interface Question {
    id: string;
    question_text: string;
    type: string;
    topic?: string;
    difficulty?: string;
    explanation?: string;
    image_base64?: string;
    image_url?: string;
    options: Option[];
}

export interface ExamElement {
    is_passage: boolean;
    passage_text?: string;
    passage_image?: string;
    passage_image_url?: string;
    questions: Question[];
}

export interface Paper {
    id: string;
    filename: string;
    uploaded_at: string;
    q_count: number;
    exam_type: string;
    duration: number;
}

export interface ScoreInfo {
    correct: number;
    total: number;
    percentage: number;
}

export type QuestionStatus = "not_visited" | "not_answered" | "answered" | "marked_review" | "answered_marked_review";

export interface PaperAttemptStats {
    attempts: number;
    best_pct: number;
    avg_pct: number;
    last_attempted_at: string;
}
