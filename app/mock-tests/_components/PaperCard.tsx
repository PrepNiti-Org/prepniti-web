import React from "react";
import { Paper, PaperAttemptStats } from "./types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, FileText, Sparkles, GraduationCap, Trophy, BarChart3, RotateCcw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PaperCardProps {
    paper: Paper;
    onStart: (paperId: string, duration: number) => void;
    loadingExam: boolean;
    selectedPaperId: string;
    attemptStats?: PaperAttemptStats;
}

export function PaperCard({ paper, onStart, loadingExam, selectedPaperId, attemptStats }: PaperCardProps) {
    const duration = paper.duration || 120;
    const isFullLength = paper.exam_type === "full";
    const hasAttempts = attemptStats && attemptStats.attempts > 0;

    return (
        <Card className={`flex flex-col justify-between hover:shadow-xl transition-all duration-300 border bg-card relative overflow-hidden group ${isFullLength
                ? "border-amber-500/20 dark:border-amber-500/10 hover:border-amber-500/40"
                : "border-border hover:border-primary/40"
            }`}>
            {isFullLength && (
                <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-amber-500/10 dark:bg-amber-500/5 blur-2xl group-hover:bg-amber-500/25 transition-all duration-300" />
            )}

            <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between mb-3">
                    {isFullLength ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-500">
                            <Sparkles className="h-3 w-3" /> Full-Length Mock
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-500">
                            <GraduationCap className="h-3 w-3" /> Practice Sheet
                        </span>
                    )}
                    <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground/60" /> {duration} Mins
                    </span>
                </div>
                <CardTitle className="text-lg font-bold leading-snug line-clamp-2 font-sans group-hover:text-primary transition-colors duration-200">
                    {paper.filename.replace(/\.[^/.]+$/, "")}
                </CardTitle>
                <CardDescription className="text-xs font-sans">
                    Published on {new Date(paper.uploaded_at).toLocaleDateString()}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-6 flex flex-col gap-3 relative z-10">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2 font-sans">
                    <FileText className="h-4 w-4 text-primary/70" /> {paper.q_count} Standard Questions
                </div>

                {hasAttempts ? (
                    <div className="bg-muted/30 border border-border/50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <RotateCcw className="h-3 w-3 text-primary" />
                                <span className="text-[11px] font-bold text-foreground">
                                    {attemptStats.attempts} {attemptStats.attempts === 1 ? 'attempt' : 'attempts'}
                                </span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                                {formatDistanceToNow(new Date(attemptStats.last_attempted_at), { addSuffix: true })}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <Trophy className="h-3 w-3 text-amber-500" />
                                <span className="text-[11px] text-muted-foreground">Best: <span className="font-bold text-foreground">{attemptStats.best_pct}%</span></span>
                            </div>
                            <div className="flex items-center gap-1">
                                <BarChart3 className="h-3 w-3 text-blue-500" />
                                <span className="text-[11px] text-muted-foreground">Avg: <span className="font-bold text-foreground">{attemptStats.avg_pct}%</span></span>
                            </div>
                        </div>
                        <div className="w-full bg-muted/60 rounded-full h-1">
                            <div
                                className="h-1 rounded-full transition-all duration-500"
                                style={{
                                    width: `${Math.min(attemptStats.best_pct, 100)}%`,
                                    background: attemptStats.best_pct >= 80 ? '#10B981' : attemptStats.best_pct >= 50 ? '#F59E0B' : '#EF4444'
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="bg-muted/20 border border-dashed border-border/40 rounded-lg p-2.5 flex items-center justify-center">
                        <span className="text-[11px] text-muted-foreground font-medium">Not attempted yet</span>
                    </div>
                )}

                <Button
                    onClick={() => onStart(paper.id, duration)}
                    className="w-full font-bold mt-1 shadow-sm rounded-xl py-5 transition-all duration-200 bg-primary hover:bg-primary/95 text-primary-foreground font-sans"
                    disabled={loadingExam}
                >
                    {loadingExam && selectedPaperId === paper.id ? "Preparing Exam..." : hasAttempts ? "Re-attempt" : "Start Attempt"}
                </Button>
            </CardContent>
        </Card>
    );
}
