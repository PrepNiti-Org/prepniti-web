import React, { useEffect, useState, useRef } from "react";
import { Paper, ExamElement, Question } from "./types";
import { getExamName } from "./utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitConfirmationModal } from "./SubmitConfirmationModal";
import { QuestionPalette } from "./QuestionPalette";

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
    useRealisticTheme?: boolean;
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
    onSubmit,
    useRealisticTheme = true
}: ExamWorkspaceProps) {
    const flatQuestions = blueprint.flatMap(el => el.questions);
    const activeQuestion = flatQuestions[currentQuestionIndex];
    const activeElement = blueprint.find(el => el.questions.some(q => q.id === activeQuestion?.id));

    // Local draft state for uncommitted options
    const [draftAnswers, setDraftAnswers] = useState<Record<string, string>>({});
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
    const prevQuestionIndexRef = useRef(currentQuestionIndex);

    // Keep draft state in sync when overall committed answers load/change
    useEffect(() => {
        setDraftAnswers(answers);
    }, [answers]);

    // Discard draft answers for previous question if user navigated away without saving/reviewing
    useEffect(() => {
        const prevIndex = prevQuestionIndexRef.current;
        if (prevIndex !== currentQuestionIndex && flatQuestions[prevIndex]) {
            const prevQ = flatQuestions[prevIndex];
            setDraftAnswers(prev => {
                const next = { ...prev };
                const committedVal = answers[prevQ.id];
                if (committedVal) {
                    next[prevQ.id] = committedVal;
                } else {
                    delete next[prevQ.id];
                }
                return next;
            });
        }
        prevQuestionIndexRef.current = currentQuestionIndex;
    }, [currentQuestionIndex, answers, flatQuestions]);

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
        setDraftAnswers(prev => ({ ...prev, [qId]: optionText }));
    };

    const handleSaveAndNext = () => {
        if (!activeQuestion) return;

        const draftVal = draftAnswers[activeQuestion.id];
        if (draftVal) {
            setAnswers(prev => ({ ...prev, [activeQuestion.id]: draftVal }));
        } else {
            setAnswers(prev => {
                const next = { ...prev };
                delete next[activeQuestion.id];
                return next;
            });
        }

        setQuestionStatuses(prev => ({
            ...prev,
            [activeQuestion.id]: draftVal ? "answered" : "not_answered"
        }));

        if (currentQuestionIndex < flatQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            toast.info("You have reached the last question. Click Submit to finish the exam.");
        }
    };

    const handleMarkForReviewAndNext = () => {
        if (!activeQuestion) return;

        const draftVal = draftAnswers[activeQuestion.id];
        if (draftVal) {
            setAnswers(prev => ({ ...prev, [activeQuestion.id]: draftVal }));
        } else {
            setAnswers(prev => {
                const next = { ...prev };
                delete next[activeQuestion.id];
                return next;
            });
        }

        setQuestionStatuses(prev => ({
            ...prev,
            [activeQuestion.id]: draftVal ? "answered_marked_review" : "marked_review"
        }));

        if (currentQuestionIndex < flatQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            toast.info("Marked for review. Last question reached.");
        }
    };

    const handleClearResponse = () => {
        if (!activeQuestion) return;

        setDraftAnswers(prev => {
            const next = { ...prev };
            delete next[activeQuestion.id];
            return next;
        });
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
                    <div className={`border border-border p-2 bg-card max-w-xl ${useRealisticTheme ? "rounded-lg" : "rounded-2xl shadow-sm"}`}>
                        <img 
                            src={`data:image/png;base64,${q.image_base64}`} 
                            alt="Question illustration" 
                            className="max-h-72 object-contain rounded bg-background" 
                        />
                    </div>
                ) : q.image_url ? (
                    <div className={`border border-border p-2 bg-card max-w-xl ${useRealisticTheme ? "rounded-lg" : "rounded-2xl shadow-sm"}`}>
                        <img 
                            src={q.image_url.startsWith("http") ? q.image_url : `http://localhost:8080${q.image_url}`} 
                            alt="Question illustration" 
                            className="max-h-72 object-contain rounded bg-background" 
                        />
                    </div>
                ) : null}

                {q.options && q.options.length > 0 ? (
                    <div className="flex flex-col gap-2.5 max-w-3xl pt-2 font-sans text-sm text-foreground">
                        {q.options.map((opt) => {
                            const isSelected = draftAnswers[q.id] === opt.option_text;
                            const optionStyle = useRealisticTheme
                                ? "flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 rounded-md transition-colors border border-transparent"
                                : `flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-900/60 rounded-xl transition-all border ${
                                    isSelected 
                                        ? "bg-primary/5 border-primary/30 dark:bg-primary/10 shadow-sm" 
                                        : "bg-background border-border/50"
                                }`;
                            return (
                                <label
                                    key={opt.id}
                                    onClick={() => handleSelectOption(q.id, opt.option_text)}
                                    className={optionStyle}
                                >
                                    <input
                                        type="radio"
                                        name={`question-${q.id}`}
                                        checked={isSelected}
                                        readOnly
                                        className="h-4.5 w-4.5 text-primary focus:ring-0 cursor-pointer"
                                    />
                                    <span>{opt.option_text}</span>
                                </label>
                            );
                        })}
                    </div>
                ) : (
                    <div className="pt-2 max-w-3xl">
                        <textarea
                            className={`w-full bg-background border border-input p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[150px] font-sans ${useRealisticTheme ? "rounded-md" : "rounded-xl"}`}
                            placeholder="Type your detailed answer response details here..."
                            value={draftAnswers[q.id] || ""}
                            onChange={e => handleSelectOption(q.id, e.target.value)}
                        />
                    </div>
                )}
            </div>
        );
    };

    const examName = getExamName(selectedPaper);
    const headerTitle = examName === "Online" ? "Online Examination" : `${examName} Online Examination`;

    const useRealistic = useRealisticTheme;

    // Style helper values
    const headerClass = useRealistic
        ? "bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0"
        : "bg-background/90 text-foreground px-6 py-4 flex items-center justify-between border-b border-border backdrop-blur-md shrink-0";

    const headerDividerClass = useRealistic ? "text-slate-600" : "text-border";
    const headerPaperClass = useRealistic ? "text-slate-300" : "text-muted-foreground";

    const timeRemainingClass = useRealistic
        ? `text-xl font-mono font-bold ${timeRemaining < 300 ? "text-red-500 animate-pulse" : "text-emerald-400"}`
        : `text-xl font-mono font-bold ${timeRemaining < 300 ? "text-red-500 animate-pulse" : "text-primary"}`;

    const timeRemainingLabelClass = useRealistic
        ? "text-xs text-slate-400 uppercase tracking-wider font-semibold font-sans"
        : "text-xs text-muted-foreground uppercase tracking-wider font-semibold font-sans";

    const sidebarClass = useRealistic
        ? "xl:col-span-1 bg-card flex flex-col justify-between p-6 overflow-hidden h-full"
        : "xl:col-span-1 bg-card border-l border-border flex flex-col justify-between p-6 overflow-hidden h-full shadow-sm";

    const leftBarHeaderClass = useRealistic
        ? "bg-slate-100 dark:bg-slate-900 border-b border-border px-6 py-3 flex items-center justify-between shrink-0"
        : "bg-card border-b border-border/60 px-6 py-3 flex items-center justify-between shrink-0";

    // Bottom Action Buttons
    const btnMarkReviewClass = useRealistic
        ? "px-4 py-2 text-xs font-semibold bg-white border border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 rounded hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors select-none font-sans"
        : "px-4 py-2.5 text-xs font-semibold bg-violet-500/10 hover:bg-violet-500/15 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 border border-violet-500/30 rounded-xl transition-all select-none font-sans";

    const btnClearClass = useRealistic
        ? "px-4 py-2 text-xs font-semibold bg-white border border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 rounded hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors select-none font-sans"
        : "px-4 py-2.5 text-xs font-semibold bg-muted hover:bg-muted/80 text-muted-foreground border border-border rounded-xl transition-all select-none font-sans";

    const btnPrevClass = useRealistic
        ? "px-4 py-2 text-xs font-semibold bg-white border border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 rounded hover:bg-slate-50 dark:hover:bg-slate-700/80 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-slate-800 transition-colors select-none font-sans"
        : "px-4 py-2.5 text-xs font-semibold bg-background hover:bg-muted text-foreground border border-input rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all select-none font-sans";

    const btnSaveClass = useRealistic
        ? "px-5 py-2 text-xs font-bold bg-[#44a037] hover:bg-[#3c8e31] text-white border border-transparent rounded transition-colors select-none font-sans shadow-sm"
        : "px-5 py-2.5 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground border border-transparent rounded-xl transition-all select-none font-sans shadow-sm shadow-primary/20 hover:shadow-md flex items-center gap-1";

    const btnSubmitClass = useRealistic
        ? "w-full h-11 font-bold text-sm tracking-wide shadow-md font-sans"
        : "w-full h-11 font-bold text-sm tracking-wide shadow-lg transition-all rounded-2xl bg-primary hover:bg-primary/95 text-primary-foreground";

    return (
        <div className="fixed inset-0 z-50 bg-background overflow-hidden flex flex-col select-none" style={{ userSelect: "none" }}>
            {/* CBT Header */}
            <div className={headerClass}>
                <div className="flex items-center gap-4">
                    <span className="font-bold text-lg tracking-wide uppercase font-sans">{headerTitle}</span>
                    <span className={headerDividerClass}>|</span>
                    <span className={`font-semibold font-sans ${headerPaperClass}`}>{selectedPaper?.exam_name || selectedPaper?.filename.replace(/\.[^/.]+$/, "")}</span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <div className={timeRemainingLabelClass}>Time Remaining</div>
                        <div className={timeRemainingClass}>
                            {formatTime(timeRemaining)}
                        </div>
                    </div>
                </div>
            </div>

            {/* CBT Main Grid Workspace */}
            <div className="grid grid-cols-1 xl:grid-cols-4 flex-1 overflow-y-auto xl:overflow-hidden bg-background">
                {/* Left area: Question Content & Action Buttons */}
                <div className="xl:col-span-3 flex flex-col justify-between border-b xl:border-b-0 xl:border-r border-border bg-slate-50/50 dark:bg-slate-950/20 overflow-hidden">
                    {/* Top question label bar */}
                    <div className={leftBarHeaderClass}>
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
                                <div className={`border border-border bg-card p-5 overflow-y-auto max-h-[500px] ${useRealistic ? "rounded-lg" : "rounded-2xl shadow-sm"}`}>
                                    <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2 font-sans">Passage Reference</div>
                                    <div className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground font-sans">{activeElement.passage_text}</div>
                                    {activeElement.passage_image ? (
                                        <img 
                                            src={`data:image/png;base64,${activeElement.passage_image}`} 
                                            alt="Passage diagram" 
                                            className={`max-h-60 object-contain border mt-4 bg-background ${useRealistic ? "rounded-md" : "rounded-xl"}`} 
                                        />
                                    ) : activeElement.passage_image_url ? (
                                        <img 
                                            src={activeElement.passage_image_url.startsWith("http") ? activeElement.passage_image_url : `http://localhost:8080${activeElement.passage_image_url}`} 
                                            alt="Passage diagram" 
                                            className={`max-h-60 object-contain border mt-4 bg-background ${useRealistic ? "rounded-md" : "rounded-xl"}`} 
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
                            <button
                                onClick={handleMarkForReviewAndNext}
                                className={btnMarkReviewClass}
                            >
                                Mark for Review & Next
                            </button>
                            <button
                                onClick={handleClearResponse}
                                className={btnClearClass}
                            >
                                Clear Response
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handlePrevious}
                                disabled={currentQuestionIndex === 0}
                                className={btnPrevClass}
                            >
                                Previous
                            </button>
                            <button
                                onClick={handleSaveAndNext}
                                className={btnSaveClass}
                            >
                                Save & Next
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right area: Candidate info, Legend, Palette, and Submit */}
                <div className={sidebarClass}>
                    <div className="flex flex-col flex-1 overflow-hidden">
                        {/* Candidate Profile block */}
                        <div className="flex items-center gap-3 border-b border-border pb-4 mb-4 shrink-0">
                            {useRealistic ? (
                                <div className="h-14 w-14 rounded bg-slate-200 dark:bg-slate-800 flex items-center justify-center border border-border text-slate-400 font-bold text-[10px] uppercase text-center leading-none p-1 font-sans">
                                    Dummy Photo
                                </div>
                            ) : (
                                <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-primary/10 to-primary/20 flex items-center justify-center border border-primary/20 text-primary font-bold text-sm uppercase shadow-inner shrink-0 font-sans animate-in fade-in duration-200">
                                    AC
                                </div>
                            )}
                            <div>
                                <div className="font-bold text-sm text-foreground font-sans">Aspirant Candidate</div>
                                <div className="text-xs text-muted-foreground font-mono font-semibold">ID: PREP-MOCK-2026</div>
                            </div>
                        </div>

                        {/* Extracted Question Palette grid and legends */}
                        <QuestionPalette
                            questionsCount={flatQuestions.length}
                            currentQuestionIndex={currentQuestionIndex}
                            onJumpToQuestion={handleJumpToQuestion}
                            questionStatuses={questionStatuses}
                            questionIds={flatQuestions.map(q => q.id)}
                            useRealisticTheme={useRealistic}
                            counts={{
                                notVisited: countStatus("not_visited"),
                                notAnswered: countStatus("not_answered"),
                                answered: countStatus("answered"),
                                markedReview: countStatus("marked_review"),
                                answeredMarkedReview: countStatus("answered_marked_review")
                            }}
                        />
                    </div>

                    <div className="border-t border-border pt-4 mt-6 shrink-0">
                        <Button 
                            onClick={() => setShowSubmitConfirm(true)} 
                            variant={useRealistic ? "destructive" : "default"}
                            className={btnSubmitClass}
                        >
                            Submit Exam
                        </Button>
                    </div>
                </div>
            </div>

            {/* Extracted Submit Confirmation Modal */}
            <SubmitConfirmationModal
                isOpen={showSubmitConfirm}
                onClose={() => setShowSubmitConfirm(false)}
                onSubmit={() => {
                    setShowSubmitConfirm(false);
                    onSubmit();
                }}
                useRealisticTheme={useRealistic}
                counts={{
                    notVisited: countStatus("not_visited"),
                    notAnswered: countStatus("not_answered"),
                    answered: countStatus("answered"),
                    markedReview: countStatus("marked_review"),
                    answeredMarkedReview: countStatus("answered_marked_review"),
                    total: flatQuestions.length
                }}
            />
        </div>
    );
}
