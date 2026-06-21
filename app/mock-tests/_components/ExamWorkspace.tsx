import React, { useEffect } from "react";
import { Paper, ExamElement, Question } from "./types";
import { getExamName } from "./utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExamWorkspaceProps {
    selectedPaper: Paper | undefined;
    timeRemaining: number;
    blueprint: ExamElement[];
    answers: Record<string, string>;
    setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    currentQuestionIndex: number;
    setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
    questionStatuses: Record<string, "not_visited" | "not_answered" | "answered" | "marked_review" | "answered_marked_review">;
    setQuestionStatuses: React.Dispatch<React.SetStateAction<Record<string, "not_visited" | "not_answered" | "answered" | "marked_review" | "answered_marked_review">>>;
    onSubmit: () => void;
}

export function ExamWorkspace({
    selectedPaper,
    timeRemaining,
    blueprint,
    answers,
    setAnswers,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    questionStatuses,
    setQuestionStatuses,
    onSubmit
}: ExamWorkspaceProps) {
    const flatQuestions = blueprint.flatMap(el => el.questions);
    const activeQuestion = flatQuestions[currentQuestionIndex];
    const activeElement = blueprint.find(el => el.questions.some(q => q.id === activeQuestion?.id));

    const countStatus = (status: string) => {
        return flatQuestions.filter(q => questionStatuses[q.id] === status).length;
    };

    // Mark viewed question as "not_answered" if it is currently "not_visited"
    useEffect(() => {
        if (flatQuestions.length > 0 && activeQuestion) {
            setQuestionStatuses(prev => {
                if (prev[activeQuestion.id] === "not_visited") {
                    return { ...prev, [activeQuestion.id]: "not_answered" };
                }
                return prev;
            });
        }
    }, [currentQuestionIndex, flatQuestions.length, activeQuestion, setQuestionStatuses]);

    const handleSelectOption = (qId: string, optionText: string) => {
        setAnswers(prev => ({ ...prev, [qId]: optionText }));
    };

    const handleSaveAndNext = () => {
        if (!activeQuestion) return;

        const hasAnswer = !!answers[activeQuestion.id];
        setQuestionStatuses(prev => ({
            ...prev,
            [activeQuestion.id]: hasAnswer ? "answered" : "not_answered"
        }));

        if (currentQuestionIndex < flatQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            toast.info("You have reached the last question. Click Submit to finish the exam.");
        }
    };

    const handleMarkForReviewAndNext = () => {
        if (!activeQuestion) return;

        const hasAnswer = !!answers[activeQuestion.id];
        setQuestionStatuses(prev => ({
            ...prev,
            [activeQuestion.id]: hasAnswer ? "answered_marked_review" : "marked_review"
        }));

        if (currentQuestionIndex < flatQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            toast.info("Marked for review. Last question reached.");
        }
    };

    const handleClearResponse = () => {
        if (!activeQuestion) return;

        setAnswers(prev => {
            const next = { ...prev };
            delete next[activeQuestion.id];
            return next;
        });
        setQuestionStatuses(prev => ({
            ...prev,
            [activeQuestion.id]: "not_answered"
        }));
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleJumpToQuestion = (index: number) => {
        setCurrentQuestionIndex(index);
    };

    const formatTime = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
    };

    const renderActiveQuestion = (q: Question | undefined) => {
        if (!q) return <div className="py-20 text-center text-muted-foreground">Select a question to display.</div>;
        
        const questionNumber = currentQuestionIndex + 1;
        return (
            <div className="space-y-6">
                <div className="text-base font-semibold leading-relaxed text-foreground font-sans">
                    <span className="text-primary font-bold mr-2">{questionNumber}.</span>
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
                            src={q.image_url.startsWith("http") ? q.image_url : `http://localhost:8080${q.image_url}`} 
                            alt="Question illustration" 
                            className="max-h-72 object-contain rounded bg-background" 
                        />
                    </div>
                ) : null}

                {q.options && q.options.length > 0 ? (
                    <div className="flex flex-col gap-3 max-w-3xl pt-2">
                        {q.options.map((opt) => {
                            const isSelected = answers[q.id] === opt.option_text;
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => handleSelectOption(q.id, opt.option_text)}
                                    className={`px-5 py-4 rounded-xl text-left text-sm font-medium border flex items-center gap-3 transition-all duration-155 ${
                                        isSelected 
                                            ? "bg-primary/10 border-primary text-primary shadow-sm" 
                                            : "border-border hover:bg-slate-100 hover:border-slate-300 dark:hover:bg-slate-900 dark:hover:border-slate-800 text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    <span className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                                        isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
                                    }`}>
                                        {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
                                    </span>
                                    <span className="font-sans">{opt.option_text}</span>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="pt-2 max-w-3xl">
                        <textarea
                            className="w-full bg-background border border-input rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[150px] font-sans"
                            placeholder="Type your detailed answer response details here..."
                            value={answers[q.id] || ""}
                            onChange={e => handleSelectOption(q.id, e.target.value)}
                        />
                    </div>
                )}
            </div>
        );
    };

    const examName = getExamName(selectedPaper);
    const headerTitle = examName === "Online" ? "Online Examination" : `${examName} Online Examination`;

    return (
        <div className="fixed inset-0 z-50 bg-background overflow-hidden flex flex-col select-none" style={{ userSelect: "none" }}>
            {/* CBT Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-4">
                    <span className="font-bold text-lg tracking-wide uppercase font-sans">{headerTitle}</span>
                    <span className="text-slate-600">|</span>
                    <span className="text-sm text-slate-300 font-semibold font-sans">{selectedPaper?.exam_name || selectedPaper?.filename.replace(/\.[^/.]+$/, "")}</span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold font-sans">Time Remaining</div>
                        <div className={`text-xl font-mono font-bold ${timeRemaining < 300 ? "text-red-500 animate-pulse" : "text-emerald-400"}`}>
                            {formatTime(timeRemaining)}
                        </div>
                    </div>
                </div>
            </div>

            {/* CBT Main Grid Workspace */}
            <div className="grid grid-cols-1 xl:grid-cols-4 flex-1 overflow-hidden bg-background">
                {/* Left area: Question Content & Action Buttons */}
                <div className="xl:col-span-3 flex flex-col justify-between border-r border-border bg-slate-50/50 dark:bg-slate-950/20 overflow-hidden">
                    {/* Top question label bar */}
                    <div className="bg-slate-100 dark:bg-slate-900 border-b border-border px-6 py-3 flex items-center justify-between shrink-0">
                        <span className="font-bold text-sm text-muted-foreground uppercase tracking-wider font-sans">
                            Question No. {currentQuestionIndex + 1}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground font-sans">View in:</span>
                            <Select defaultValue="English">
                                <SelectTrigger className="bg-background border border-input rounded px-2 py-0.5 text-xs focus:outline-none font-sans h-7 w-[90px]">
                                    <SelectValue placeholder="English" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="English">English</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Active Question Pane */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        {activeElement?.is_passage ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-[400px]">
                                {/* Passage Pane (Left) */}
                                <div className="border border-border rounded-lg bg-card p-5 overflow-y-auto max-h-[500px]">
                                    <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2 font-sans">Passage Reference</div>
                                    <div className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground font-sans">{activeElement.passage_text}</div>
                                    {activeElement.passage_image ? (
                                        <img 
                                            src={`data:image/png;base64,${activeElement.passage_image}`} 
                                            alt="Passage diagram" 
                                            className="max-h-60 object-contain rounded-md border mt-4 bg-background" 
                                        />
                                    ) : activeElement.passage_image_url ? (
                                        <img 
                                            src={activeElement.passage_image_url.startsWith("http") ? activeElement.passage_image_url : `http://localhost:8080${activeElement.passage_image_url}`} 
                                            alt="Passage diagram" 
                                            className="max-h-60 object-contain rounded-md border mt-4 bg-background" 
                                        />
                                    ) : null}
                                </div>

                                {/* Question Pane (Right) */}
                                <div className="flex flex-col justify-between">
                                    {renderActiveQuestion(activeQuestion)}
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-4xl mx-auto w-full">
                                {renderActiveQuestion(activeQuestion)}
                            </div>
                        )}
                    </div>

                    {/* Bottom CBT Action Bar */}
                    <div className="bg-slate-100 dark:bg-slate-900 border-t border-border px-6 py-4 flex flex-wrap gap-3 items-center justify-between shrink-0">
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                onClick={handleMarkForReviewAndNext}
                                className="bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900 dark:text-indigo-400 font-sans"
                            >
                                Mark for Review & Next
                            </Button>
                            <Button 
                                variant="ghost" 
                                onClick={handleClearResponse}
                                className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 font-sans"
                            >
                                Clear Response
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                onClick={handlePrevious} 
                                disabled={currentQuestionIndex === 0}
                                className="font-sans"
                            >
                                Previous
                            </Button>
                            <Button 
                                variant="default" 
                                onClick={handleSaveAndNext}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold font-sans"
                            >
                                Save & Next
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right area: Candidate info, Legend, Palette, and Submit */}
                <div className="xl:col-span-1 bg-card flex flex-col justify-between p-6 overflow-y-auto">
                    <div>
                        {/* Candidate Profile block */}
                        <div className="flex items-center gap-3 border-b border-border pb-4 mb-4">
                            <div className="h-14 w-14 rounded bg-slate-200 dark:bg-slate-800 flex items-center justify-center border border-border text-slate-400 font-bold text-[10px] uppercase text-center leading-none p-1 font-sans">
                                Dummy Photo
                            </div>
                            <div>
                                <div className="font-bold text-sm text-foreground font-sans">Aspirant Candidate</div>
                                <div className="text-xs text-muted-foreground font-mono font-semibold">ID: PREP-MOCK-2026</div>
                            </div>
                        </div>

                        {/* Palette Legend */}
                        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                            <div className="flex items-center gap-2">
                                <span className="h-6 w-8 rounded flex items-center justify-center bg-emerald-500 text-white font-bold text-xs font-mono">
                                    {countStatus("answered")}
                                </span>
                                <span className="text-muted-foreground font-sans">Answered</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-6 w-8 rounded flex items-center justify-center bg-red-500 text-white font-bold text-xs font-mono">
                                    {countStatus("not_answered")}
                                </span>
                                <span className="text-muted-foreground font-sans">Not Answered</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-6 w-8 rounded flex items-center justify-center bg-slate-200 dark:bg-slate-800 text-foreground font-bold text-xs border border-border font-mono">
                                    {countStatus("not_visited")}
                                </span>
                                <span className="text-muted-foreground font-sans">Not Visited</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-6 w-8 rounded flex items-center justify-center bg-indigo-500 text-white font-bold text-xs font-mono">
                                    {countStatus("marked_review")}
                                </span>
                                <span className="text-muted-foreground font-sans">Marked for Review</span>
                            </div>
                            <div className="flex items-center gap-2 col-span-2">
                                <span className="h-6 w-8 rounded-full flex items-center justify-center bg-indigo-500 text-white font-bold text-xs relative after:content-[''] after:absolute after:bottom-0 after:right-0 after:h-2 after:w-2 after:bg-emerald-500 after:rounded-full after:border after:border-white font-mono">
                                    {countStatus("answered_marked_review")}
                                </span>
                                <span className="text-muted-foreground font-sans">Answered & Marked for Review</span>
                            </div>
                        </div>

                        {/* Question Palette Header */}
                        <div className="bg-slate-100 dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 rounded border border-border uppercase tracking-wider mb-3 font-sans">
                            Question Palette
                        </div>

                        {/* Question Grid list */}
                        <div className="max-h-[240px] overflow-y-auto pr-1">
                            <div className="grid grid-cols-5 gap-2">
                                {flatQuestions.map((q, idx) => {
                                    const status = questionStatuses[q.id] || "not_visited";
                                    const isActive = idx === currentQuestionIndex;
                                    
                                    let statusStyle = "bg-slate-200 dark:bg-slate-800 text-foreground border-border";
                                    if (status === "answered") {
                                        statusStyle = "bg-emerald-500 text-white border-emerald-500";
                                    } else if (status === "not_answered") {
                                        statusStyle = "bg-red-500 text-white border-red-500";
                                    } else if (status === "marked_review") {
                                        statusStyle = "bg-indigo-500 text-white border-indigo-500 rounded-full";
                                    } else if (status === "answered_marked_review") {
                                        statusStyle = "bg-indigo-500 text-white border-indigo-500 rounded-full relative after:content-[''] after:absolute after:bottom-0 after:right-0 after:h-2 after:w-2 after:bg-emerald-500 after:rounded-full after:border after:border-white";
                                    }

                                    return (
                                        <button
                                            key={q.id}
                                            onClick={() => handleJumpToQuestion(idx)}
                                            className={`h-9 w-full flex items-center justify-center text-xs font-bold border transition-all duration-200 rounded ${statusStyle} ${
                                                isActive ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105" : "hover:opacity-90"
                                            }`}
                                        >
                                            {idx + 1}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border pt-4 mt-6">
                        <Button 
                            onClick={onSubmit} 
                            variant="destructive"
                            className="w-full h-11 font-bold text-sm tracking-wide shadow-md font-sans"
                        >
                            Submit Exam
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
