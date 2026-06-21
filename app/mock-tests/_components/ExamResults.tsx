import React, { useState } from "react";
import { ScoreInfo, ExamElement } from "./types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, BarChart3, AlertCircle, FileQuestion, Percent, ShieldAlert } from "lucide-react";
import { BACKEND_URL } from "@/lib/api";

interface ExamResultsProps {
    scoreInfo: ScoreInfo;
    blueprint: ExamElement[];
    answers: Record<string, string>;
    onReset: () => void;
    securityViolation?: string | null;
}

type FilterType = "all" | "correct" | "incorrect" | "unattempted";

export function ExamResults({ scoreInfo, blueprint, answers, onReset, securityViolation }: ExamResultsProps) {
    const [filter, setFilter] = useState<FilterType>("all");
    const flatQuestions = blueprint.flatMap(el => el.questions);

    // Compute metrics
    const totalQuestions = flatQuestions.length;
    const attemptedCount = flatQuestions.filter(q => !!answers[q.id]).length;
    const unattemptedCount = totalQuestions - attemptedCount;
    const correctCount = scoreInfo.correct;
    const incorrectCount = attemptedCount - correctCount;
    const accuracyRate = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

    // Filter questions logic
    const filteredQuestions = flatQuestions.filter(q => {
        const correctOpt = q.options.find(o => o.is_correct);
        const userAnswer = answers[q.id];
        const isAttempted = !!userAnswer;
        const isCorrect = correctOpt ? userAnswer === correctOpt.option_text : false;

        if (filter === "correct") return isAttempted && isCorrect;
        if (filter === "incorrect") return isAttempted && !isCorrect;
        if (filter === "unattempted") return !isAttempted;
        return true; // "all"
    });

    // Circular SVG Progress Ring Helper
    const ProgressRing = ({ percentage, colorClass, size = 120, strokeWidth = 8, label }: { percentage: number; colorClass: string; size?: number; strokeWidth?: number; label: string }) => {
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (percentage / 100) * circumference;

        return (
            <div className="flex flex-col items-center gap-2">
                <div className="relative" style={{ width: size, height: size }}>
                    <svg className="w-full h-full transform -rotate-90">
                        {/* Background Ring */}
                        <circle
                            className="text-slate-100 dark:text-slate-800"
                            strokeWidth={strokeWidth}
                            stroke="currentColor"
                            fill="transparent"
                            r={radius}
                            cx={size / 2}
                            cy={size / 2}
                        />
                        {/* Foreground Progress Ring */}
                        <circle
                            className={`transition-all duration-500 ease-out ${colorClass}`}
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r={radius}
                            cx={size / 2}
                            cy={size / 2}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-2xl font-black font-mono">{percentage}%</span>
                    </div>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
            </div>
        );
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto font-sans">
            {/* Security Violation Alert Banner */}
            {securityViolation && (
                <div className="flex items-start gap-4 rounded-xl border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/30 px-5 py-4 shadow-lg shadow-rose-500/10 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="shrink-0 mt-0.5">
                        <div className="h-10 w-10 rounded-full bg-rose-500 flex items-center justify-center shadow-md shadow-rose-500/30">
                            <ShieldAlert className="h-5 w-5 text-white" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wide mb-1">⚠ Security Violation — Exam Auto-Submitted</p>
                        <p className="text-sm text-rose-700 dark:text-rose-300 leading-relaxed">
                            Your exam was automatically submitted because: <strong>{securityViolation}</strong>. Exiting fullscreen mode during an exam is a security violation and is strictly prohibited.
                        </p>
                        <p className="text-xs text-rose-500 dark:text-rose-400/70 mt-2 font-medium">
                            This incident has been recorded. All unanswered questions at the time of submission are counted as skipped.
                        </p>
                    </div>
                </div>
            )}
            {/* Top Overview Scorecard */}
            <Card className="border-primary/10 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-950/30 overflow-hidden shadow-md">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-3xl font-extrabold tracking-tight">Performance Summary</CardTitle>
                    <CardDescription>Official exam grading and accuracy breakdown</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-8">
                    {/* Visual Progress Rings */}
                    <div className="flex flex-wrap items-center justify-center gap-12 border-b border-border pb-6">
                        <ProgressRing 
                            percentage={scoreInfo.percentage} 
                            colorClass="text-primary" 
                            label="Overall Score" 
                        />
                        <ProgressRing 
                            percentage={accuracyRate} 
                            colorClass="text-emerald-500" 
                            label="Accuracy Rate" 
                        />
                    </div>

                    {/* Numeric stats grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-card border border-border/80 rounded-xl p-4 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <Percent className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-xl font-bold font-mono leading-tight">{correctCount} / {totalQuestions}</div>
                                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Correct Choices</div>
                            </div>
                        </div>

                        <div className="bg-card border border-border/80 rounded-xl p-4 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                                <BarChart3 className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-xl font-bold font-mono leading-tight">{attemptedCount}</div>
                                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Attempted Items</div>
                            </div>
                        </div>

                        <div className="bg-card border border-border/80 rounded-xl p-4 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                                <AlertCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-xl font-bold font-mono leading-tight">{incorrectCount}</div>
                                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Wrong Responses</div>
                            </div>
                        </div>

                        <div className="bg-card border border-border/80 rounded-xl p-4 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-slate-500/10 text-slate-500 flex items-center justify-center shrink-0">
                                <FileQuestion className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-xl font-bold font-mono leading-tight">{unattemptedCount}</div>
                                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Skipped/Left</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center pt-2">
                        <Button onClick={onReset} className="w-full max-w-xs font-bold py-5 rounded-xl shadow-lg">
                            Attempt Another Test
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Interactive Filters and Question Reviews */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-3">
                    <h3 className="text-xl font-bold tracking-tight">Answer Sheet & Explanations</h3>
                    
                    {/* Filters bar */}
                    <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-border/60">
                        <Button
                            variant={filter === "all" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setFilter("all")}
                            className="text-xs h-7 rounded-lg"
                        >
                            All ({totalQuestions})
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setFilter("correct")}
                            className={`text-xs h-7 rounded-lg ${
                                filter === "correct"
                                    ? "bg-emerald-500 text-white hover:bg-emerald-500/90"
                                    : "text-muted-foreground hover:text-emerald-500 bg-transparent hover:bg-emerald-500/10"
                            }`}
                        >
                            Correct ({correctCount})
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setFilter("incorrect")}
                            className={`text-xs h-7 rounded-lg ${
                                filter === "incorrect"
                                    ? "bg-rose-500 text-white hover:bg-rose-500/90"
                                    : "text-muted-foreground hover:text-rose-500 bg-transparent hover:bg-rose-500/10"
                            }`}
                        >
                            Incorrect ({incorrectCount})
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setFilter("unattempted")}
                            className={`text-xs h-7 rounded-lg ${
                                filter === "unattempted"
                                    ? "bg-slate-500 text-white hover:bg-slate-500/90"
                                    : "text-muted-foreground hover:text-foreground bg-transparent hover:bg-muted"
                            }`}
                        >
                            Unattempted ({unattemptedCount})
                        </Button>
                    </div>
                </div>

                {/* Questions Display */}
                {filteredQuestions.length === 0 ? (
                    <div className="py-16 text-center text-muted-foreground border border-dashed rounded-xl bg-card">
                        No questions match the selected filter.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {blueprint.map((el, elIdx) => {
                            // Check if this passage elements list contains any of the filtered questions
                            const passageQuestionsFiltered = el.questions.filter(q => 
                                filteredQuestions.some(fq => fq.id === q.id)
                            );

                            if (passageQuestionsFiltered.length === 0) return null;

                            return (
                                <div key={elIdx} className="space-y-6">
                                    {el.is_passage && el.passage_text && (
                                        <div className="bg-muted/40 border-l-4 border-primary rounded-r-xl p-5 space-y-3">
                                            <div className="text-xs font-bold text-primary uppercase tracking-wider">Passage Reference</div>
                                            <div className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">{el.passage_text}</div>
                                            {el.passage_image ? (
                                                <img 
                                                    src={`data:image/png;base64,${el.passage_image}`} 
                                                    alt="Passage diagram" 
                                                    className="max-h-72 object-contain rounded-md border mt-4 bg-background" 
                                                />
                                            ) : el.passage_image_url ? (
                                                <img 
                                                    src={el.passage_image_url.startsWith("http") ? el.passage_image_url : `${BACKEND_URL}${el.passage_image_url}`} 
                                                    alt="Passage diagram" 
                                                    className="max-h-72 object-contain rounded-md border mt-4 bg-background" 
                                                />
                                            ) : null}
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        {passageQuestionsFiltered.map((q) => {
                                            const questionNumber = flatQuestions.findIndex(fq => fq.id === q.id) + 1;
                                            const correctOpt = q.options.find(o => o.is_correct);
                                            const userAnswer = answers[q.id];
                                            const isAttempted = !!userAnswer;
                                            const isCorrect = correctOpt ? (userAnswer === correctOpt.option_text) : false;

                                            let cardBorderClass = "border-l-slate-400 bg-slate-500/5 dark:bg-slate-900/10";
                                            let badgeEl = (
                                                <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                                                    Skipped / Unattempted
                                                </span>
                                            );

                                            if (isAttempted) {
                                                if (isCorrect) {
                                                    cardBorderClass = "border-l-emerald-500 bg-emerald-500/5 dark:bg-emerald-950/10";
                                                    badgeEl = (
                                                        <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-500">
                                                            Correct Response
                                                        </span>
                                                    );
                                                } else {
                                                    cardBorderClass = "border-l-rose-500 bg-rose-500/5 dark:bg-rose-950/10";
                                                    badgeEl = (
                                                        <span className="inline-flex items-center rounded-full bg-rose-100 dark:bg-rose-900/30 px-2.5 py-0.5 text-xs font-semibold text-rose-500">
                                                            Incorrect Response
                                                        </span>
                                                    );
                                                }
                                            }

                                            return (
                                                <Card key={q.id} className={`border-l-4 transition-all ${cardBorderClass}`}>
                                                    <CardContent className="pt-6 space-y-4">
                                                        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border/40 pb-3">
                                                            <span className="text-primary font-bold text-sm">Question {questionNumber}</span>
                                                            {badgeEl}
                                                        </div>

                                                        <div className="font-semibold text-base leading-snug pt-1">
                                                            {q.question_text}
                                                        </div>

                                                        {q.image_base64 ? (
                                                            <div className="border border-border rounded-lg p-2 bg-card max-w-xl">
                                                                <img 
                                                                    src={`data:image/png;base64,${q.image_base64}`} 
                                                                    alt="Question illustration" 
                                                                    className="max-h-72 object-contain rounded bg-background" 
                                                                />
                                                            </div>
                                                        ) : q.image_url ? (
                                                            <div className="border border-border rounded-lg p-2 bg-card max-w-xl">
                                                                <img 
                                                                    src={q.image_url.startsWith("http") ? q.image_url : `${BACKEND_URL}${q.image_url}`} 
                                                                    alt="Question illustration" 
                                                                    className="max-h-72 object-contain rounded bg-background" 
                                                                />
                                                            </div>
                                                        ) : null}

                                                        {q.options && q.options.length > 0 ? (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                                                {q.options.map((opt) => {
                                                                    const isSelected = userAnswer === opt.option_text;
                                                                    const isOptCorrect = opt.is_correct;
                                                                    let btnClass = "border-border text-muted-foreground opacity-60";
                                                                    if (isSelected && isOptCorrect) {
                                                                        btnClass = "bg-green-500/10 border-green-500 text-green-500";
                                                                    } else if (isSelected && !isOptCorrect) {
                                                                        btnClass = "bg-red-500/10 border-red-500 text-red-500";
                                                                    } else if (isOptCorrect) {
                                                                        btnClass = "bg-green-500/10 border-green-500 text-green-500 opacity-90";
                                                                    }
                                                                    
                                                                    return (
                                                                        <div
                                                                            key={opt.id}
                                                                            className={`px-4 py-3 rounded-lg text-left text-sm font-medium border flex items-center justify-between ${btnClass}`}
                                                                        >
                                                                            <span>{opt.option_text}</span>
                                                                            {isSelected && isOptCorrect && <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />}
                                                                            {isSelected && !isOptCorrect && <XCircle className="h-4 w-4 shrink-0 text-red-500" />}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <div className="bg-muted/50 rounded-lg p-3 text-sm">
                                                                <div className="text-xs text-muted-foreground font-semibold uppercase mb-1">Your Submission</div>
                                                                <div className="text-foreground">{userAnswer || "No Response"}</div>
                                                            </div>
                                                        )}

                                                        {q.explanation && (
                                                            <div className="bg-muted/30 border border-border/50 rounded-lg p-4 space-y-1.5 mt-2">
                                                                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Explanation & Solution Details</div>
                                                                <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">{q.explanation}</div>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
