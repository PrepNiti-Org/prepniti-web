import React from "react";
import { Paper } from "./types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, FileText } from "lucide-react";

interface PaperCardProps {
    paper: Paper;
    onStart: (paperId: string, duration: number) => void;
    loadingExam: boolean;
    selectedPaperId: string;
}

export function PaperCard({ paper, onStart, loadingExam, selectedPaperId }: PaperCardProps) {
    let duration = 120;
    if (paper.q_count <= 25) {
        duration = 30;
    } else if (paper.q_count <= 50) {
        duration = 60;
    }

    return (
        <Card className="flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-border bg-card">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        Official Test
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {duration} Mins
                    </span>
                </div>
                <CardTitle className="text-lg font-bold leading-snug line-clamp-2">
                    {paper.filename.replace(/\.[^/.]+$/, "")}
                </CardTitle>
                <CardDescription className="text-xs">
                    Uploaded on {new Date(paper.uploaded_at).toLocaleDateString()}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-6 flex flex-col gap-4">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" /> {paper.q_count} Questions
                </div>
                <Button 
                    onClick={() => onStart(paper.id, duration)} 
                    className="w-full font-semibold mt-2"
                    disabled={loadingExam}
                >
                    {loadingExam && selectedPaperId === paper.id ? "Preparing test..." : "Start Mock Exam"}
                </Button>
            </CardContent>
        </Card>
    );
}
