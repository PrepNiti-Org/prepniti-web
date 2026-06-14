"use client";

import React, { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { Paper, ExamElement, ScoreInfo } from "./_components/types";
import { useExamSecurity } from "./_components/useExamSecurity";
import { PaperCard } from "./_components/PaperCard";
import { ExamInstructions } from "./_components/ExamInstructions";
import { ExamWorkspace } from "./_components/ExamWorkspace";
import { ExamResults } from "./_components/ExamResults";

export default function MockTestsPage() {
    const [step, setStep] = useState<"setup" | "instructions" | "testing" | "result">("setup");
    const [papers, setPapers] = useState<Paper[]>([]);
    const [loadingPapers, setLoadingPapers] = useState(true);

    // Config states
    const [selectedPaperId, setSelectedPaperId] = useState("");

    // Exam runtime states
    const [blueprint, setBlueprint] = useState<ExamElement[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({}); // question_id -> option_text
    const [timeRemaining, setTimeRemaining] = useState(1800); // in seconds
    const [loadingExam, setLoadingExam] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Results states
    const [scoreInfo, setScoreInfo] = useState<ScoreInfo>({ correct: 0, total: 0, percentage: 0 });

    // CBT runtime states
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questionStatuses, setQuestionStatuses] = useState<Record<string, "not_visited" | "not_answered" | "answered" | "marked_review" | "answered_marked_review">>({});

    // Instructions states
    const [defaultLanguage, setDefaultLanguage] = useState("English");
    const [selectedPaperDuration, setSelectedPaperDuration] = useState(120);

    // Security submit reference
    const submitRef = useRef<() => void>(() => { });

    // Hook to monitor browser boundaries, developer tool hotkeys and disable copying
    const { enterFullscreen, exitFullscreen } = useExamSecurity(step, submitRef);

    useEffect(() => {
        // Fetch papers
        api.get<Paper[]>("/papers")
            .then(res => {
                setPapers(res.data);
                if (res.data.length > 0) {
                    setSelectedPaperId(res.data[0].id);
                }
            })
            .catch(() => {
                toast.error("Failed to load papers list");
            })
            .finally(() => {
                setLoadingPapers(false);
            });
    }, []);

    // Countdown Timer logic
    useEffect(() => {
        if (step === "testing") {
            timerRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        handleSubmitExam();
                        toast.warning("Time limit reached. Test submitted.");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [step]);

    const handleStartExamForPaper = async (paperId: string, durationMin: number) => {
        setLoadingExam(true);
        setSelectedPaperId(paperId);
        try {
            const res = await api.get<ExamElement[]>(`/papers/${paperId}/questions`);
            if (res.data.length === 0) {
                toast.error("This test paper has no questions.");
                return;
            }
            setBlueprint(res.data);
            setAnswers({});

            // Initialize all question statuses to "not_visited"
            const flat = res.data.flatMap(el => el.questions);
            const initialStatuses: Record<string, "not_visited" | "not_answered" | "answered" | "marked_review" | "answered_marked_review"> = {};
            flat.forEach((q, idx) => {
                initialStatuses[q.id] = idx === 0 ? "not_answered" : "not_visited";
            });
            setQuestionStatuses(initialStatuses);
            setCurrentQuestionIndex(0);

            setSelectedPaperDuration(durationMin);
            setTimeRemaining(durationMin * 60);

            // Go to instructions screen first
            setStep("instructions");
        } catch {
            toast.error("Failed to load mock exam questions");
        } finally {
            setLoadingExam(false);
        }
    };

    const handleSubmitExam = async () => {
        // Exit fullscreen if browser is in fullscreen mode
        await exitFullscreen();

        let correctCount = 0;
        let totalCount = 0;

        blueprint.forEach(el => {
            el.questions.forEach(q => {
                const correctOpt = q.options.find(o => o.is_correct);
                if (correctOpt) {
                    totalCount++;
                    if (answers[q.id] === correctOpt.option_text) {
                        correctCount++;
                    }
                }
            });
        });

        const pct = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
        setScoreInfo({ correct: correctCount, total: totalCount, percentage: pct });

        // Save Attempt to Database via Go backend
        const activePaper = papers.find(p => p.id === selectedPaperId);
        try {
            await api.post("/users/me/stats", {
                exam_name: activePaper ? activePaper.filename : "Custom Test",
                score: parseFloat(correctCount.toFixed(1)),
                max_score: parseFloat(totalCount.toFixed(1))
            });
        } catch {
            // Silently capture scoring save errors
        }

        setStep("result");
    };

    // Update submission reference for event listeners
    useEffect(() => {
        submitRef.current = handleSubmitExam;
    }, [blueprint, answers, selectedPaperId, papers]);

    const activePaper = papers.find(p => p.id === selectedPaperId);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <AnimatePresence mode="wait">
                {/* 1. SETUP STEP */}
                {step === "setup" && (
                    <motion.div
                        key="setup-screen"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <GraduationCap className="h-8 w-8 text-primary" />
                            <div>
                                <h1 className="text-3xl font-extrabold tracking-tight font-sans">Mock Tests</h1>
                                <p className="text-muted-foreground text-sm font-sans">Attempt mock papers and evaluate your performance under realistic exam constraints.</p>
                            </div>
                        </div>

                        {loadingPapers ? (
                            <div className="py-20 text-center text-muted-foreground font-sans">Loading mock exam list...</div>
                        ) : papers.length === 0 ? (
                            <div className="py-20 text-center text-muted-foreground font-sans">No mock tests have been published by the administrator yet.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {papers.map(p => (
                                    <PaperCard
                                        key={p.id}
                                        paper={p}
                                        onStart={handleStartExamForPaper}
                                        loadingExam={loadingExam}
                                        selectedPaperId={selectedPaperId}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* 2. INSTRUCTIONS STEP */}
                {step === "instructions" && (
                    <ExamInstructions
                        selectedPaper={activePaper}
                        selectedPaperDuration={selectedPaperDuration}
                        onStartExam={async () => {
                            await enterFullscreen();
                            setStep("testing");
                        }}
                        onCancel={() => setStep("setup")}
                        defaultLanguage={defaultLanguage}
                        setDefaultLanguage={setDefaultLanguage}
                    />
                )}

                {/* 3. TESTING STEP */}
                {step === "testing" && (
                    <ExamWorkspace
                        selectedPaper={activePaper}
                        timeRemaining={timeRemaining}
                        blueprint={blueprint}
                        answers={answers}
                        setAnswers={setAnswers}
                        currentQuestionIndex={currentQuestionIndex}
                        setCurrentQuestionIndex={setCurrentQuestionIndex}
                        questionStatuses={questionStatuses}
                        setQuestionStatuses={setQuestionStatuses}
                        onSubmit={handleSubmitExam}
                    />
                )}

                {/* 4. RESULT STEP */}
                {step === "result" && (
                    <motion.div
                        key="result-screen"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                    >
                        <ExamResults
                            scoreInfo={scoreInfo}
                            blueprint={blueprint}
                            answers={answers}
                            onReset={() => setStep("setup")}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
