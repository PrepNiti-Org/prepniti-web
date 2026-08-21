"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isValid } from "date-fns";
import {
    Calendar,
    Target,
    Maximize2,
    Minimize2,
    Shuffle,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile, UserProfile } from "@/features/profile/api";
import { User } from "@/features/auth/hooks/useAuth";
import { toast } from "sonner";
import { FOCUS_WALLPAPERS } from "../constants/wallpapers";
import { EXAM_CATEGORIES } from "../constants/categories";
import { ASPIRANT_MOTIVATIONAL_QUOTES } from "../constants/quotes";
import { useTargetCountdown } from "../hooks/useTargetCountdown";

interface ExamCountdownModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userProfile?: UserProfile | User | null;
}

function AnimatedSingleDigit({ digit }: { digit: string }) {
    const num = parseInt(digit, 10);
    if (isNaN(num)) {
        return <span className="inline-block">{digit}</span>;
    }

    return (
        <div className="relative inline-block overflow-hidden h-[1em] w-[0.62em] align-top text-center select-none">
            <motion.div
                initial={false}
                animate={{ y: `-${num * 10}%` }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 24,
                    mass: 0.8,
                }}
                className="absolute inset-x-0 top-0 flex flex-col"
            >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((val) => (
                    <div
                        key={val}
                        className="h-[1em] flex items-center justify-center font-black tracking-tight"
                    >
                        {val}
                    </div>
                ))}
            </motion.div>
        </div>
    );
}

function SmoothRollingNumber({ value }: { value: number }) {
    const padded = String(Math.max(0, value)).padStart(2, "0");
    return (
        <span className="inline-flex font-mono font-black text-white tracking-tight leading-none drop-shadow-2xl">
            {padded.split("").map((char, index) => (
                <AnimatedSingleDigit key={index} digit={char} />
            ))}
        </span>
    );
}

export function ExamCountdownModal({
    open,
    onOpenChange,
    userProfile,
}: ExamCountdownModalProps) {
    const queryClient = useQueryClient();
    const { activeTarget, units, isConfigured } = useTargetCountdown(userProfile);

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [wallpaperIndex, setWallpaperIndex] = useState<number>(() => {
        const today = new Date();
        const start = new Date(today.getFullYear(), 0, 0);
        const diff = today.getTime() - start.getTime();
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        return Math.abs(dayOfYear) % FOCUS_WALLPAPERS.length;
    });
    const [currentQuote, setCurrentQuote] = useState<{ quote: string; author: string }>(() => {
        const today = new Date();
        const start = new Date(today.getFullYear(), 0, 0);
        const diff = today.getTime() - start.getTime();
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        const dailyIndex = Math.abs(dayOfYear) % ASPIRANT_MOTIVATIONAL_QUOTES.length;
        return ASPIRANT_MOTIVATIONAL_QUOTES[dailyIndex];
    });

    const [inputCategory, setInputCategory] = useState(userProfile?.target_exam || "UPSC");
    const [inputExam, setInputExam] = useState(userProfile?.target_exam_name || userProfile?.target_exam || "");
    const [inputDate, setInputDate] = useState(userProfile?.target_exam_date ? userProfile.target_exam_date.split("T")[0] : "");

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    const toggleBrowserFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    }, []);

    const handleShuffle = useCallback(() => {
        setWallpaperIndex((prev) => (prev + 1) % FOCUS_WALLPAPERS.length);
        const randomQuote = ASPIRANT_MOTIVATIONAL_QUOTES[Math.floor(Math.random() * ASPIRANT_MOTIVATIONAL_QUOTES.length)];
        setCurrentQuote(randomQuote);
    }, []);

    const handleCloseModal = useCallback(() => {
        if (typeof document !== "undefined" && document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }
        onOpenChange(false);
    }, [onOpenChange]);

    const handleDialogChange = useCallback((newOpen: boolean) => {
        if (!newOpen && typeof document !== "undefined" && document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }
        onOpenChange(newOpen);
    }, [onOpenChange]);

    const profileMutation = useMutation({
        mutationFn: updateUserProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            queryClient.invalidateQueries({ queryKey: ["auth"] });
            toast.success("Target exam & date saved!");
        },
        onError: (err: unknown) => {
            const errorObj = err as { response?: { data?: { error?: string } } };
            toast.error(errorObj?.response?.data?.error || "Failed to save profile");
        }
    });

    const handleInitialSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputDate) return;
        const finalExamName = inputExam.trim() || inputCategory;

        if (typeof window !== "undefined") {
            localStorage.setItem("prepniti_target_exam_date", inputDate);
            localStorage.setItem("prepniti_target_exam_label", finalExamName);
        }

        profileMutation.mutate({
            username: userProfile?.username || "",
            bio: userProfile?.bio || "",
            target_exam: inputCategory,
            target_exam_name: finalExamName,
            target_exam_date: inputDate,
            is_public: userProfile?.is_public ?? true,
        });
    };

    const currentWallpaper = FOCUS_WALLPAPERS[wallpaperIndex] || FOCUS_WALLPAPERS[0];

    const displayUnits = [
        { label: "months", value: units.months },
        { label: "days", value: units.days },
        { label: "hours", value: units.hours },
        { label: "minutes", value: units.minutes },
        { label: "seconds", value: units.seconds },
    ];

    return (
        <Dialog open={open} onOpenChange={handleDialogChange}>
            <DialogContent
                className="!fixed !inset-0 !z-[100] !w-screen !h-screen !max-w-none !max-h-none !m-0 !p-0 !border-0 !rounded-none !bg-black text-white !translate-x-0 !translate-y-0 !top-0 !left-0 overflow-hidden select-none [&>button]:hidden"
                aria-describedby={undefined}
            >
                <DialogTitle className="sr-only">Target Exam Countdown & Motivation</DialogTitle>

                <div className="absolute inset-0 z-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentWallpaper.id}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8 }}
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                            style={{ backgroundImage: `url('${currentWallpaper.url}')` }}
                        />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/40 to-black/70" />
                </div>

                <div className="absolute top-5 sm:top-6 right-5 sm:right-10 z-50 flex items-center gap-2 pointer-events-auto">
                    <button
                        type="button"
                        onClick={handleShuffle}
                        className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white backdrop-blur-md border border-white/15 transition-all cursor-pointer shadow-lg active:scale-95"
                        title="Shuffle wallpaper & quote"
                    >
                        <Shuffle className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={toggleBrowserFullscreen}
                        className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white backdrop-blur-md border border-white/15 transition-all cursor-pointer shadow-lg active:scale-95"
                        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </button>
                    <button
                        type="button"
                        onClick={handleCloseModal}
                        className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white backdrop-blur-md border border-white/15 transition-all cursor-pointer shadow-lg active:scale-95"
                        title="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6 text-center max-w-5xl mx-auto py-12">
                    {isConfigured && activeTarget ? (
                        <div className="w-full flex flex-col items-center justify-center space-y-10 sm:space-y-12">
                            <motion.div
                                key={currentQuote.quote}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="max-w-2xl px-4 text-center space-y-3"
                            >
                                <blockquote className="text-xl sm:text-2xl md:text-3xl font-serif italic text-white/95 leading-relaxed tracking-wide drop-shadow-lg">
                                    &ldquo;{currentQuote.quote}&rdquo;
                                </blockquote>
                                <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-white/60 font-semibold">
                                    <span className="h-px w-6 bg-white/30" />
                                    <span>{currentQuote.author}</span>
                                    <span className="h-px w-6 bg-white/30" />
                                </div>
                            </motion.div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-center gap-2 sm:gap-4 text-3xl sm:text-5xl md:text-6xl">
                                    {displayUnits.map((unit, index) => (
                                        <div key={unit.label} className="flex items-center gap-2 sm:gap-4">
                                            <div className="flex flex-col items-center">
                                                <SmoothRollingNumber value={unit.value} />
                                                <span className="text-[9px] sm:text-xs uppercase font-extrabold tracking-widest text-white/50 mt-1">
                                                    {unit.label}
                                                </span>
                                            </div>
                                            {index < displayUnits.length - 1 && (
                                                <span className="text-2xl sm:text-4xl text-white/30 font-thin mb-4 select-none">
                                                    :
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 flex justify-center">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-white/80 shadow-sm">
                                        <Calendar className="h-3.5 w-3.5 text-primary" />
                                        <span className="font-bold text-white">{activeTarget.name}</span>
                                        <span className="opacity-40">•</span>
                                        <span>{isValid(activeTarget.date) ? format(activeTarget.date, "dd MMMM yyyy") : ""}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleInitialSubmit} className="w-full max-w-md p-8 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/20 space-y-4 text-left shadow-2xl">
                            <div className="space-y-1 text-center pb-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-xs font-bold text-primary mb-1">
                                    <Target className="h-3.5 w-3.5" /> Target Exam Goal
                                </div>
                                <h3 className="text-xl font-bold text-white">Configure Your Countdown</h3>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-white/80">
                                    Exam Category
                                </label>
                                <select
                                    value={inputCategory}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setInputCategory(val);
                                        const cat = EXAM_CATEGORIES.find(c => c.id === val);
                                        if (cat?.suggestions?.length) {
                                            setInputExam(cat.suggestions[0]);
                                        }
                                    }}
                                    className="h-10 w-full text-sm bg-white/10 border border-white/25 text-white rounded-xl px-3 outline-none focus:ring-2 focus:ring-primary"
                                >
                                    {EXAM_CATEGORIES.map(cat => (
                                        <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-white/80">
                                    Specific Exam Title
                                </label>
                                <Input
                                    type="text"
                                    value={inputExam}
                                    onChange={(e) => setInputExam(e.target.value)}
                                    placeholder="e.g. SBI PO 2026, UPSC CSE"
                                    className="h-10 text-sm bg-white/10 border-white/25 text-white rounded-xl placeholder:text-white/40"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-white/80">
                                    Target Exam Date
                                </label>
                                <Input
                                    type="date"
                                    value={inputDate}
                                    onChange={(e) => setInputDate(e.target.value)}
                                    className="h-10 text-sm bg-white/10 border-white/25 text-white rounded-xl"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={profileMutation.isPending}
                                className="w-full h-11 text-sm font-bold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg mt-3 cursor-pointer"
                            >
                                {profileMutation.isPending ? "Saving..." : "Start My Countdown"}
                            </Button>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
