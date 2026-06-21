import { Paper } from "./types";

export function getExamName(paper: Paper | undefined): string {
    if (!paper || !paper.target_exam || paper.target_exam.toLowerCase() === "other" || paper.target_exam.trim() === "") {
        return "Online";
    }
    return paper.target_exam;
}
