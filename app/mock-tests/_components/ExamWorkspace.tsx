import React, { useEffect, useState, useRef, useMemo } from "react";
import { Paper, ExamElement, Question } from "./types";
import { getExamName } from "./utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitConfirmationModal } from "./SubmitConfirmationModal";
import { QuestionPalette } from "./QuestionPalette";
import { VirtualCalculator } from "./VirtualCalculator";
import { BACKEND_URL } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { X, LayoutGrid } from "lucide-react";

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

    const [draftAnswers, setDraftAnswers] = useState<Record<string, string>>({});
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
    const prevQuestionIndexRef = useRef(currentQuestionIndex);

    const [showCalculator, setShowCalculator] = useState(false);
    const [showPaletteMobile, setShowPaletteMobile] = useState(false);

    const sections = useMemo(() => {
        const topicsSet = new Set<string>();
        flatQuestions.forEach(q => {
            if (q.topic) {
                topicsSet.add(q.topic);
            }
        });
        const topics = Array.from(topicsSet);
        if (topics.length === 0) {
            return ["General"];
        }
        return topics;
    }, [flatQuestions]);

    const [activeSection, setActiveSection] = useState<string>("");

    useEffect(() => {
        if (sections.length > 0 && !activeSection) {
            setActiveSection(sections[0]);
        }
    }, [sections, activeSection]);

    // Reset activeSection if it becomes invalid under a new list of sections
    useEffect(() => {
        if (sections.length > 0 && !sections.includes(activeSection)) {
            setActiveSection(sections[0]);
        }
    }, [sections, activeSection]);

    useEffect(() => {
        if (flatQuestions.length > 0 && activeQuestion) {
            const currentTopic = activeQuestion.topic || "General";
            if (sections.includes(currentTopic) && activeSection !== currentTopic) {
                setActiveSection(currentTopic);
            }
        }
    }, [currentQuestionIndex, activeQuestion, sections, activeSection, flatQuestions]);

    useEffect(() => {
        setDraftAnswers(answers);
    }, [answers]);

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
                            src={q.image_url.startsWith("http") ? q.image_url : `${BACKEND_URL}${q.image_url}`}
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
                                : `flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-900/60 rounded-xl transition-all border ${isSelected
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

    const headerClass = useRealistic
        ? "bg-slate-900 text-white px-3 py-2 md:px-6 md:py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0"
        : "bg-background/90 text-foreground px-3 py-2 md:px-6 md:py-3.5 flex items-center justify-between border-b border-border backdrop-blur-md shrink-0";

    const headerDividerClass = useRealistic ? "text-slate-600" : "text-border";
    const headerPaperClass = useRealistic ? "text-slate-300" : "text-muted-foreground";

    const timeRemainingClass = useRealistic
        ? `text-xl font-mono font-bold ${timeRemaining < 300 ? "text-red-500 animate-pulse" : "text-emerald-400"}`
        : `text-xl font-mono font-bold ${timeRemaining < 300 ? "text-red-500 animate-pulse" : "text-primary"}`;

    const timeRemainingLabelClass = useRealistic
        ? "text-xs text-slate-400 uppercase tracking-wider font-semibold font-sans"
        : "text-xs text-muted-foreground uppercase tracking-wider font-semibold font-sans";

    const sidebarClass = useRealistic
        ? "hidden xl:flex xl:col-span-1 bg-card flex-col justify-between p-6 overflow-hidden h-full"
        : "hidden xl:flex xl:col-span-1 bg-card border-l border-border flex-col justify-between p-6 overflow-hidden h-full shadow-sm";

    const leftBarHeaderClass = useRealistic
        ? "bg-slate-100 dark:bg-slate-900 border-b border-border px-6 py-3 flex items-center justify-between shrink-0"
        : "bg-card border-b border-border/60 px-6 py-3 flex items-center justify-between shrink-0";

    // Bottom Action Buttons
    const btnMarkReviewClass = useRealistic
        ? "px-4 py-2 text-xs font-semibold bg-white border border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 rounded hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors select-none font-sans cursor-pointer"
        : "px-4 py-2.5 text-xs font-semibold bg-violet-500/10 hover:bg-violet-500/15 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 border border-violet-500/30 rounded-xl transition-all select-none font-sans cursor-pointer";

    const btnClearClass = useRealistic
        ? "px-4 py-2 text-xs font-semibold bg-white border border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 rounded hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors select-none font-sans cursor-pointer"
        : "px-4 py-2.5 text-xs font-semibold bg-muted hover:bg-muted/80 text-muted-foreground border border-border rounded-xl transition-all select-none font-sans cursor-pointer";

    const btnPrevClass = useRealistic
        ? "px-4 py-2 text-xs font-semibold bg-white border border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 rounded hover:bg-slate-50 dark:hover:bg-slate-700/80 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-slate-800 transition-colors select-none font-sans cursor-pointer"
        : "px-4 py-2.5 text-xs font-semibold bg-background hover:bg-muted text-foreground border border-input rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all select-none font-sans cursor-pointer";

    const btnSaveClass = useRealistic
        ? "px-5 py-2 text-xs font-bold bg-[#44a037] hover:bg-[#3c8e31] text-white border border-transparent rounded transition-colors select-none font-sans shadow-sm cursor-pointer"
        : "px-5 py-2.5 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground border border-transparent rounded-xl transition-all select-none font-sans shadow-sm shadow-primary/20 hover:shadow-md flex items-center gap-1 cursor-pointer";

    const btnSubmitClass = useRealistic
        ? "w-full h-11 font-bold text-sm tracking-wide shadow-md font-sans cursor-pointer"
        : "w-full h-11 font-bold text-sm tracking-wide shadow-lg transition-all rounded-2xl bg-primary hover:bg-primary/95 text-primary-foreground cursor-pointer";

    return (
        <div className="fixed inset-0 z-50 bg-background overflow-hidden flex flex-col select-none" style={{ userSelect: "none" }}>
            <div className={headerClass}>
                <div className="flex items-center gap-2 md:gap-4 overflow-hidden mr-2">
                    <span className="font-bold text-xs md:text-sm tracking-wide uppercase font-sans hidden md:inline-block shrink-0">{headerTitle}</span>
                    <span className={`hidden md:inline-block ${headerDividerClass} shrink-0`}>|</span>
                    <span className={`font-bold md:font-semibold text-xs md:text-sm font-sans truncate max-w-[140px] sm:max-w-[240px] md:max-w-none ${headerPaperClass}`}>
                        {selectedPaper?.exam_name || selectedPaper?.filename.replace(/\.[^/.]+$/, "")}
                    </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 md:gap-6 shrink-0">
                    <button
                        onClick={() => setShowCalculator(prev => !prev)}
                        className={`flex items-center gap-1.5 px-2 py-1 md:px-3 md:py-1.5 text-[10px] md:text-xs font-bold transition-all border select-none cursor-pointer ${useRealistic
                                ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 rounded-none shadow-sm font-sans"
                                : "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 rounded-xl font-sans"
                            }`}
                    >
                        <svg className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="hidden sm:inline">Calculator</span>
                    </button>
                    <button
                        onClick={() => setShowPaletteMobile(prev => !prev)}
                        className={`xl:hidden flex items-center gap-1.5 px-2 py-1 md:px-3 md:py-1.5 text-[10px] md:text-xs font-bold transition-all border select-none cursor-pointer ${useRealistic
                                ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750 rounded-none shadow-sm font-sans"
                                : "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 rounded-xl font-sans"
                            }`}
                    >
                        <LayoutGrid className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                        <span className="hidden sm:inline">Questions</span>
                    </button>
                    <div className="text-right">
                        <div className={`hidden sm:block ${timeRemainingLabelClass}`}>Time Remaining</div>
                        <div className={timeRemainingClass}>
                            {formatTime(timeRemaining)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 flex-1 overflow-hidden bg-background">
                <div className="xl:col-span-3 flex flex-col justify-between border-b xl:border-b-0 xl:border-r border-border bg-slate-50/50 dark:bg-slate-950/20 overflow-hidden h-full">
                    {sections.length > 1 && (
                        <div className={useRealistic
                            ? "bg-slate-200 dark:bg-slate-950 border-b border-slate-300 dark:border-slate-800 px-4 pt-1.5 flex gap-1 shrink-0 overflow-x-auto"
                            : "bg-muted/30 border-b border-border p-2 flex gap-1.5 shrink-0 overflow-x-auto"
                        }>
                            {sections.map((sec) => {
                                const isActive = activeSection === sec;
                                const tabBtnClass = isActive
                                    ? (useRealistic
                                        ? "bg-[#2f5597] text-white border-t border-x border-[#2f5597] font-bold text-xs px-5 py-2 rounded-t-sm"
                                        : "bg-primary text-primary-foreground font-bold text-xs px-4 py-2 rounded-xl shadow-sm")
                                    : (useRealistic
                                        ? "bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-t border-x border-slate-300 dark:border-slate-800 text-xs px-5 py-2 rounded-t-sm"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground text-xs px-4 py-2 rounded-xl");
                                return (
                                    <button
                                        key={sec}
                                        onClick={() => {
                                            setActiveSection(sec);
                                            const firstQIdx = flatQuestions.findIndex(q => (q.topic || "General") === sec);
                                            if (firstQIdx !== -1) {
                                                setCurrentQuestionIndex(firstQIdx);
                                            }
                                        }}
                                        className={`transition-all select-none font-sans cursor-pointer ${tabBtnClass}`}
                                    >
                                        {sec}
                                    </button>
                                );
                            })}
                        </div>
                    )}

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

                    <div className="flex-1 p-6 overflow-y-auto">
                        {activeElement?.is_passage ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-[400px]">
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
                                            src={activeElement.passage_image_url.startsWith("http") ? activeElement.passage_image_url : `${BACKEND_URL}${activeElement.passage_image_url}`}
                                            alt="Passage diagram"
                                            className={`max-h-60 object-contain border mt-4 bg-background ${useRealistic ? "rounded-md" : "rounded-xl"}`}
                                        />
                                    ) : null}
                                </div>

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

                <div className={sidebarClass}>
                    <div className="flex flex-col flex-1 overflow-hidden">
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
                            activeSection={activeSection}
                            questionTopics={flatQuestions.map(q => q.topic || "General")}
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

            <VirtualCalculator
                isOpen={showCalculator}
                onClose={() => setShowCalculator(false)}
                useRealisticTheme={useRealistic}
            />

            <AnimatePresence>
                {showPaletteMobile && (
                    <div className="fixed inset-0 z-50 xl:hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPaletteMobile(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute right-0 top-0 bottom-0 w-80 bg-background border-l border-border p-6 flex flex-col justify-between shadow-2xl h-full overflow-hidden"
                        >
                            <div className="flex flex-col flex-1 overflow-hidden">
                                <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                                    <span className="font-bold text-sm text-foreground font-sans">Exam Navigation</span>
                                    <button
                                        onClick={() => setShowPaletteMobile(false)}
                                        className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                
                                <div className="flex items-center gap-3 border-b border-border pb-4 mb-4 shrink-0">
                                    {useRealistic ? (
                                        <div className="h-12 w-12 rounded bg-slate-200 dark:bg-slate-800 flex items-center justify-center border border-border text-slate-400 font-bold text-[9px] uppercase text-center leading-none p-1 font-sans">
                                            Dummy Photo
                                        </div>
                                    ) : (
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-primary/10 to-primary/20 flex items-center justify-center border border-primary/20 text-primary font-bold text-xs uppercase shadow-inner shrink-0 font-sans">
                                            AC
                                        </div>
                                    )}
                                    <div>
                                        <div className="font-bold text-xs text-foreground font-sans">Aspirant Candidate</div>
                                        <div className="text-[10px] text-muted-foreground font-mono font-semibold">Roll No: PN-2026-MOCK</div>
                                    </div>
                                </div>

                                <QuestionPalette
                                    questionsCount={flatQuestions.length}
                                    currentQuestionIndex={currentQuestionIndex}
                                    onJumpToQuestion={(idx) => {
                                        handleJumpToQuestion(idx);
                                        setShowPaletteMobile(false);
                                    }}
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
                                    activeSection={activeSection}
                                    questionTopics={flatQuestions.map(q => q.topic || "General")}
                                />
                            </div>

                            <div className="border-t border-border pt-4 mt-6 shrink-0 flex flex-col gap-2">
                                <Button
                                    onClick={() => {
                                        setShowPaletteMobile(false);
                                        setShowSubmitConfirm(true);
                                    }}
                                    variant={useRealistic ? "destructive" : "default"}
                                    className={btnSubmitClass}
                                >
                                    Submit Exam
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
