"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { api } from "@/lib/api";
import { getMockTestInsights, MockTestInsights } from "@/features/profile/api";
import { GraduationCap, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/features/auth/hooks/useAuth";

import { Paper, ExamElement, ScoreInfo, PaperAttemptStats } from "./_components/types";
import { useExamSecurity } from "./_components/useExamSecurity";
import { PaperCard } from "./_components/PaperCard";
import { ExamInstructions } from "./_components/ExamInstructions";
import { ExamWorkspace } from "./_components/ExamWorkspace";
import { ExamResults } from "./_components/ExamResults";

export default function MockTestsPage() {
    const { isLoggedIn, user, isHydrated } = useAuth();
    const [step, setStep] = useState<"setup" | "instructions" | "testing" | "result">("setup");
    const [useRealisticTheme, setUseRealisticTheme] = useState(true);
    const [papers, setPapers] = useState<Paper[]>([]);
    const [loadingPapers, setLoadingPapers] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"all" | "full" | "practice">("all");
    const [selectedPaperId, setSelectedPaperId] = useState("");
    const [blueprint, setBlueprint] = useState<ExamElement[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeRemaining, setTimeRemaining] = useState(1800);
    const [loadingExam, setLoadingExam] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [scoreInfo, setScoreInfo] = useState<ScoreInfo>({ correct: 0, total: 0, percentage: 0 });
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questionStatuses, setQuestionStatuses] = useState<Record<string, "not_visited" | "not_answered" | "answered" | "marked_review" | "answered_marked_review">>({});
    const [defaultLanguage, setDefaultLanguage] = useState("English");
    const [selectedPaperDuration, setSelectedPaperDuration] = useState(120);
    const [mockInsights, setMockInsights] = useState<MockTestInsights | null>(null);
    const [securityViolation, setSecurityViolation] = useState<string | null>(null);
    const submitRef = useRef<(reason?: string) => void>(() => { });
    const { enterFullscreen, exitFullscreen } = useExamSecurity(step, submitRef);

    useEffect(() => {
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

        getMockTestInsights()
            .then(data => setMockInsights(data))
            .catch(() => { });
    }, []);

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

            const flat = res.data.flatMap(el => el.questions);
            const initialStatuses: Record<string, "not_visited" | "not_answered" | "answered" | "marked_review" | "answered_marked_review"> = {};
            flat.forEach((q, idx) => {
                initialStatuses[q.id] = idx === 0 ? "not_answered" : "not_visited";
            });
            setQuestionStatuses(initialStatuses);
            setCurrentQuestionIndex(0);

            setSelectedPaperDuration(durationMin);
            setTimeRemaining(durationMin * 60);

            setStep("instructions");
        } catch {
            toast.error("Failed to load mock exam questions");
        } finally {
            setLoadingExam(false);
        }
    };

    const handleSubmitExam = async (reason?: string) => {
        if (reason) {
            setSecurityViolation(reason);
        } else {
            setSecurityViolation(null);
        }
        await exitFullscreen();

        let correctCount = 0;
        let totalCount = 0;

        blueprint.forEach(el => {
            el.questions.forEach(q => {
                totalCount++;
                const correctOpt = q.options.find(o => o.is_correct);
                if (correctOpt && answers[q.id] === correctOpt.option_text) {
                    correctCount++;
                }
            });
        });

        const pct = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
        setScoreInfo({ correct: correctCount, total: totalCount, percentage: pct });

        const activePaper = papers.find(p => p.id === selectedPaperId);
        try {
            await api.post("/users/me/stats", {
                exam_name: activePaper ? activePaper.filename : "Custom Test",
                score: parseFloat(correctCount.toFixed(1)),
                max_score: parseFloat(totalCount.toFixed(1))
            });
            getMockTestInsights()
                .then(data => setMockInsights(data))
                .catch(() => { });
        } catch {
        }

        setStep("result");
    };

    useEffect(() => {
        submitRef.current = (reason?: string) => handleSubmitExam(reason);
    }, [blueprint, answers, selectedPaperId, papers]);

    const activePaper = papers.find(p => p.id === selectedPaperId);

    const filteredPapers = papers.filter(p => {
        const matchesSearch = p.filename.toLowerCase().includes(searchQuery.toLowerCase());
        const isFullLength = p.exam_type === "full";
        if (activeTab === "full") return matchesSearch && isFullLength;
        if (activeTab === "practice") return matchesSearch && !isFullLength;
        return matchesSearch;
    });

    const paperAttemptMap = useMemo(() => {
        const map: Record<string, PaperAttemptStats> = {};
        if (!mockInsights?.per_paper) return map;
        for (const paper of papers) {
            const match = mockInsights.per_paper.find(
                pp => pp.exam_name === paper.filename
            );
            if (match) {
                map[paper.id] = {
                    attempts: match.attempts,
                    best_pct: match.best_pct,
                    avg_pct: match.avg_pct,
                    last_attempted_at: match.last_attempted_at,
                };
            }
        }
        return map;
    }, [papers, mockInsights]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <AnimatePresence mode="wait">
                {step === "setup" && (
                    <motion.div
                        key="setup-screen"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-3">
                                <GraduationCap className="h-8 w-8 text-primary" />
                                <div>
                                    <h1 className="text-3xl font-extrabold tracking-tight font-sans">Mock Tests</h1>
                                    <p className="text-muted-foreground text-sm font-sans">Attempt mock papers and evaluate your performance under realistic exam constraints.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 bg-card border border-border p-4 rounded-2xl shadow-sm">
                            <div className="relative w-full md:max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search mock papers..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 bg-background/50 border-border rounded-xl focus-visible:ring-1"
                                />
                            </div>
                            <div className="flex items-center gap-1.5 p-1 bg-muted/50 rounded-xl border border-border/50 w-full md:w-auto overflow-x-auto">
                                <Button
                                    variant={activeTab === "all" ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setActiveTab("all")}
                                    className="text-xs font-semibold rounded-lg whitespace-nowrap"
                                >
                                    All Mocks
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => setActiveTab("full")}
                                    className={`text-xs font-bold rounded-lg whitespace-nowrap ${activeTab === "full"
                                        ? "bg-amber-500 text-slate-950 hover:bg-amber-500/90 shadow-sm"
                                        : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                                    }`}
                                >
                                    Full-Length Mocks
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => setActiveTab("practice")}
                                    className={`text-xs font-bold rounded-lg whitespace-nowrap ${activeTab === "practice"
                                        ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 hover:bg-emerald-600/90 shadow-sm"
                                        : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                                    }`}
                                >
                                    Practice Sheets
                                </Button>
                            </div>
                        </div>

                        {loadingPapers || !isHydrated ? (
                            <div className="py-20 text-center text-muted-foreground font-sans">Loading mock exam list...</div>
                        ) : papers.length === 0 ? (
                            <div className="py-20 text-center text-muted-foreground font-sans">No mock tests have been published by the administrator yet.</div>
                        ) : filteredPapers.length === 0 ? (
                            <div className="py-20 text-center text-muted-foreground font-sans">No mock tests found matching your search or filters.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredPapers.map(p => (
                                    <PaperCard
                                        key={p.id}
                                        paper={p}
                                        onStart={handleStartExamForPaper}
                                        loadingExam={loadingExam}
                                        selectedPaperId={selectedPaperId}
                                        attemptStats={paperAttemptMap[p.id]}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

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
                        useRealisticTheme={useRealisticTheme}
                        setUseRealisticTheme={setUseRealisticTheme}
                    />
                )}

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
                        useRealisticTheme={useRealisticTheme}
                    />
                )}

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
                            onReset={() => {
                                setSecurityViolation(null);
                                setStep("setup");
                            }}
                            securityViolation={securityViolation}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
