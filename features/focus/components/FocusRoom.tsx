"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
    Play,
    Pause,
    RotateCcw,
    CheckCircle2,
    Target,
    Maximize2,
    Minimize2,
    Shuffle,
    Timer,
    Clock,
    Flame,
    History,
    Sparkles,
    Minus,
    Plus,
    PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import {
    getTasks,
    getActiveSession,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    discardSession,
    getUserTimeLogs,
    Task,
    SessionResponseData,
} from "@/features/kanban/api";
import {
    formatTime,
    getDisplayElapsed,
    dispatchSessionUpdate,
    ActiveSession,
} from "@/features/kanban/timerUtils";
import { FOCUS_WALLPAPERS } from "@/features/countdown/constants/wallpapers";
import { ASPIRANT_MOTIVATIONAL_QUOTES } from "@/features/countdown/constants/quotes";
import { AmbientSoundPlayer } from "./AmbientSoundPlayer";
import { ManualTimeLogCard } from "./ManualTimeLogCard";
import { DigitalTimerDisplay } from "./clocks/DigitalTimerDisplay";
import { StopwatchDisplay } from "./clocks/StopwatchDisplay";

export type PrimaryMode = "TIMER" | "STOPWATCH";

const QUICK_DURATIONS = [15, 25, 45, 60];

interface FocusRoomProps {
    initialTaskId?: string;
}

export function FocusRoom({ initialTaskId }: FocusRoomProps) {
    const queryClient = useQueryClient();
    const [primaryMode, setPrimaryMode] = useState<PrimaryMode>("TIMER");
    const [selectedMinutes, setSelectedMinutes] = useState<number>(25);
    const [selectedTaskId, setSelectedTaskId] = useState<string>(initialTaskId || "");
    const [session, setSession] = useState<ActiveSession | null>(null);
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                localStorage.setItem("prepniti_focus_timer_config", JSON.stringify({
                    targetDurationSeconds: selectedMinutes * 60,
                    mode: primaryMode
                }));
            } catch {
                // Ignore
            }
        }
    }, [selectedMinutes, primaryMode]);

    const [isZenMode, setIsZenMode] = useState(false);
    const [wallpaperIndex, setWallpaperIndex] = useState<number>(0);
    const [quoteIndex, setQuoteIndex] = useState<number>(0);

    const [showLogDialog, setShowLogDialog] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showOfflineModal, setShowOfflineModal] = useState(false);
    const [logNote, setLogNote] = useState("");

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const todayStr = format(new Date(), "yyyy-MM-dd");
    const { data: timeLogsData } = useQuery({
        queryKey: ["userTimeLogs", todayStr],
        queryFn: () => getUserTimeLogs(todayStr, todayStr),
    });

    const totalTodayMinutes = timeLogsData?.total_minutes || 0;
    const todayHours = Math.floor(totalTodayMinutes / 60);
    const todayMins = totalTodayMinutes % 60;
    const sessionCount = timeLogsData?.data?.length || 0;

    const { data: tasks = [] } = useQuery<Task[]>({
        queryKey: ["tasks"],
        queryFn: getTasks,
    });

    const mapSessionData = useCallback((data: SessionResponseData | null): ActiveSession | null => {
        if (!data) return null;
        return {
            sessionId: data.id,
            taskId: data.task_id,
            taskTitle: data.task_title,
            startedAt: data.started_at ? new Date(data.started_at).getTime() : null,
            accumulatedSeconds: data.accumulated_seconds,
            isPaused: data.is_paused,
            targetDurationSeconds: selectedMinutes * 60,
            mode: primaryMode,
        };
    }, [selectedMinutes, primaryMode]);

    useQuery({
        queryKey: ["activeSession"],
        queryFn: async () => {
            const data = await getActiveSession();
            const active = mapSessionData(data);
            setSession(active);
            if (active) {
                setElapsed(getDisplayElapsed(active));
                if (active.taskId) setSelectedTaskId(active.taskId);
            }
            return active;
        },
        staleTime: 1000 * 30,
    });

    const activeSelectedTask = tasks.find((t) => t.id === (session?.taskId || selectedTaskId));

    useEffect(() => {
        const handleSessionUpdateEvent = (e: Event) => {
            const customEvent = e as CustomEvent<ActiveSession | null>;
            const newSession = customEvent.detail;
            setSession(newSession);
            if (newSession) {
                setElapsed(getDisplayElapsed(newSession));
                if (newSession.taskId) setSelectedTaskId(newSession.taskId);
            } else {
                setElapsed(0);
            }
        };

        window.addEventListener("session-update", handleSessionUpdateEvent);

        return () => {
            window.removeEventListener("session-update", handleSessionUpdateEvent);
        };
    }, []);

    useEffect(() => {
        if (session && !session.isPaused) {
            intervalRef.current = setInterval(() => {
                setElapsed(getDisplayElapsed(session));
            }, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [session]);

    const fireConfetti = () => {
        try {
            confetti({
                particleCount: 90,
                spread: 75,
                origin: { y: 0.6 },
                colors: ["#3b82f6", "#10b981", "#FF5722", "#8b5cf6"],
            });
        } catch {
        }
    };

    const startMutation = useMutation({
        mutationFn: async (taskIdToStart: string) => {
            const targetTask = tasks.find((t) => t.id === taskIdToStart) || tasks[0];
            const targetId = taskIdToStart || targetTask?.id || "";
            if (!targetId) {
                throw new Error("Please create at least one target in Tracker to link your session.");
            }
            return await startSession(targetId);
        },
        onSuccess: (data) => {
            const active = mapSessionData(data);
            setSession(active);
            dispatchSessionUpdate(active);
            toast.success(`Started: ${data.task_title || "Focus session"}`);
        },
        onError: (err: unknown) => {
            const msg =
                (err as { response?: { data?: { error?: string } }; message?: string })?.response?.data?.error ||
                (err as Error)?.message ||
                "Failed to start session";
            toast.error(msg);
        },
    });

    const pauseMutation = useMutation({
        mutationFn: pauseSession,
        onSuccess: (data) => {
            const active = mapSessionData(data);
            setSession(active);
            dispatchSessionUpdate(active);
        },
    });

    const resumeMutation = useMutation({
        mutationFn: resumeSession,
        onSuccess: (data) => {
            const active = mapSessionData(data);
            setSession(active);
            dispatchSessionUpdate(active);
        },
    });

    const stopMutation = useMutation({
        mutationFn: (note?: string) => stopSession(note),
        onSuccess: (res) => {
            fireConfetti();
            setSession(null);
            setElapsed(0);
            dispatchSessionUpdate(null);
            setShowLogDialog(false);
            setLogNote("");
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["userTimeLogs"] });
            queryClient.invalidateQueries({ queryKey: ["profile-stats"] });
            queryClient.invalidateQueries({ queryKey: ["profile-activity"] });
            toast.success(`🎉 ${res.duration_minutes} minutes recorded.`);
        },
        onError: () => {
            toast.error("Failed to stop session");
        },
    });

    const discardMutation = useMutation({
        mutationFn: discardSession,
        onSuccess: () => {
            setSession(null);
            setElapsed(0);
            dispatchSessionUpdate(null);
            toast.info("Session reset");
        },
    });

    const isRunning = Boolean(session && !session.isPaused);
    const isPaused = Boolean(session && session.isPaused);
    const isTimerMode = primaryMode === "TIMER";

    const targetTimerSeconds = selectedMinutes * 60;

    const displaySeconds = isTimerMode
        ? Math.max(0, targetTimerSeconds - elapsed)
        : elapsed;

    const formattedTime = isTimerMode
        ? `${String(Math.floor(displaySeconds / 60)).padStart(2, "0")}:${String(displaySeconds % 60).padStart(2, "0")}`
        : formatTime(displaySeconds);

    const handleToggle = useCallback(() => {
        if (isRunning) {
            pauseMutation.mutate();
        } else if (isPaused) {
            resumeMutation.mutate();
        } else {
            startMutation.mutate(selectedTaskId);
        }
    }, [isRunning, isPaused, pauseMutation, resumeMutation, startMutation, selectedTaskId]);

    const handleShuffleWallpaper = useCallback(() => {
        setWallpaperIndex((prev) => (prev + 1) % FOCUS_WALLPAPERS.length);
        setQuoteIndex((prev) => (prev + 1) % ASPIRANT_MOTIVATIONAL_QUOTES.length);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
                return;
            }

            if (e.code === "Space") {
                e.preventDefault();
                handleToggle();
            } else if (e.key === "z" || e.key === "Z") {
                e.preventDefault();
                setIsZenMode((prev) => !prev);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleToggle]);

    const currentWallpaper = FOCUS_WALLPAPERS[wallpaperIndex] || FOCUS_WALLPAPERS[0];
    const currentQuote = ASPIRANT_MOTIVATIONAL_QUOTES[quoteIndex] || ASPIRANT_MOTIVATIONAL_QUOTES[0];

    return (
        <div className="relative w-full h-[calc(100vh-8rem)] max-h-[calc(100vh-8rem)] overflow-hidden flex flex-col justify-between items-center p-4 sm:p-6 select-none">
            <motion.div
                animate={{
                    scale: isRunning ? [1, 1.08, 1] : 1,
                    opacity: isRunning ? [0.25, 0.45, 0.25] : 0.12,
                }}
                transition={{
                    repeat: isRunning ? Infinity : 0,
                    duration: 6,
                    ease: "easeInOut",
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-162.5 h-162.5 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10"
            />

            <AnimatePresence>
                {isZenMode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-12 text-white select-none overflow-hidden"
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 -z-10 scale-105"
                            style={{ backgroundImage: `url('${currentWallpaper.url}')` }}
                        />
                        <div className="absolute inset-0 bg-linear-to-b from-black/85 via-black/50 to-black/90 -z-10" />

                        <div className="w-full flex items-center justify-between max-w-3xl">
                            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold">
                                <Sparkles className="w-3.5 h-3.5 text-primary" />
                                <span>{activeSelectedTask ? activeSelectedTask.title : "Deep Focus"}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <AmbientSoundPlayer />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleShuffleWallpaper}
                                    className="text-white hover:bg-white/20 rounded-full h-8 w-8 p-0 cursor-pointer"
                                    title="Shuffle Background"
                                >
                                    <Shuffle className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsZenMode(false)}
                                    className="text-white hover:bg-white/20 rounded-full h-8 w-8 p-0 cursor-pointer"
                                    title="Exit Zen Mode [Z]"
                                >
                                    <Minimize2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center space-y-4">
                            {isTimerMode ? (
                                <DigitalTimerDisplay formattedTime={formattedTime} />
                            ) : (
                                <StopwatchDisplay
                                    formattedTime={formattedTime}
                                    elapsedSeconds={elapsed}
                                    isRunning={isRunning}
                                />
                            )}

                            <blockquote className="max-w-xl text-center text-xs sm:text-sm italic text-white/80 drop-shadow-md pt-2">
                                &ldquo;{currentQuote.quote}&rdquo;
                                <footer className="text-[10px] uppercase tracking-widest text-white/40 font-bold not-italic mt-1">
                                    — {currentQuote.author}
                                </footer>
                            </blockquote>

                            <div className="flex items-center gap-3 pt-1">
                                <Button
                                    size="lg"
                                    onClick={handleToggle}
                                    disabled={startMutation.isPending}
                                    className="h-12 px-8 rounded-full text-xs font-bold shadow-xl transition-transform active:scale-95 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2 fill-current" />}
                                    {isRunning ? "Pause Session" : isPaused ? "Resume Session" : "Start Session"}
                                </Button>

                                {(isRunning || isPaused) && (
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        onClick={() => setShowLogDialog(true)}
                                        className="h-12 px-5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md cursor-pointer"
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-400" />
                                        Complete & Log
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="text-[11px] text-white/40 font-medium">
                            Press Esc or click Minimize to exit Zen mode
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center p-1 rounded-full bg-muted/50 border border-border/30 shadow-xs shrink-0">
                <button
                    type="button"
                    disabled={isRunning || isPaused}
                    onClick={() => setPrimaryMode("TIMER")}
                    className={`flex items-center gap-1.5 px-5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        primaryMode === "TIMER"
                            ? "bg-background text-foreground shadow-xs font-bold"
                            : "text-muted-foreground hover:text-foreground disabled:opacity-50"
                    }`}
                >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Timer</span>
                </button>

                <button
                    type="button"
                    disabled={isRunning || isPaused}
                    onClick={() => setPrimaryMode("STOPWATCH")}
                    className={`flex items-center gap-1.5 px-5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        primaryMode === "STOPWATCH"
                            ? "bg-background text-foreground shadow-xs font-bold"
                            : "text-muted-foreground hover:text-foreground disabled:opacity-50"
                    }`}
                >
                    <Timer className="w-3.5 h-3.5" />
                    <span>Stopwatch</span>
                </button>
            </div>

            <main className="flex flex-col items-center justify-center space-y-4 max-w-sm w-full mx-auto my-auto">
                {isTimerMode && !isRunning && !isPaused && (
                    <div className="flex items-center gap-1.5 p-1 rounded-full bg-muted/30 border border-border/20 text-xs">
                        {QUICK_DURATIONS.map((mins) => {
                            const isSelected = selectedMinutes === mins;
                            return (
                                <button
                                    key={mins}
                                    type="button"
                                    onClick={() => setSelectedMinutes(mins)}
                                    className={`px-3.5 py-1 rounded-full font-mono text-xs font-bold transition-all cursor-pointer ${
                                        isSelected
                                            ? "bg-primary text-primary-foreground shadow-xs"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {mins}m
                                </button>
                            );
                        })}

                        <div className="flex items-center gap-1 pl-1 border-l border-border/40">
                            <button
                                type="button"
                                onClick={() => setSelectedMinutes((prev) => Math.max(5, prev - 5))}
                                className="w-5.5 h-5.5 rounded-full bg-background hover:bg-muted flex items-center justify-center text-foreground cursor-pointer transition-all border border-border/30"
                                title="-5 Minutes"
                            >
                                <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-mono text-xs font-bold text-foreground px-1 min-w-7.5 text-center">
                                {selectedMinutes}m
                            </span>
                            <button
                                type="button"
                                onClick={() => setSelectedMinutes((prev) => Math.min(180, prev + 5))}
                                className="w-5.5 h-5.5 rounded-full bg-background hover:bg-muted flex items-center justify-center text-foreground cursor-pointer transition-all border border-border/30"
                                title="+5 Minutes"
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                )}

                <div className="py-2 flex items-center justify-center">
                    {isTimerMode ? (
                        <DigitalTimerDisplay formattedTime={formattedTime} />
                    ) : (
                        <StopwatchDisplay
                            formattedTime={formattedTime}
                            elapsedSeconds={elapsed}
                            isRunning={isRunning}
                        />
                    )}
                </div>

                <div className="w-full max-w-xs flex items-center justify-center gap-2.5 pt-1">
                    <Button
                        size="lg"
                        onClick={handleToggle}
                        disabled={startMutation.isPending || pauseMutation.isPending || resumeMutation.isPending}
                        className="flex-1 h-12 rounded-full text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2 fill-current" />}
                        {isRunning ? "Pause Session" : isPaused ? "Resume Session" : "Start Focus"}
                    </Button>

                    {(isRunning || isPaused) && (
                        <>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => setShowLogDialog(true)}
                                className="h-12 px-4 rounded-full text-xs font-bold border-border/60 hover:bg-muted cursor-pointer shadow-xs"
                            >
                                <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-500" />
                                Done
                            </Button>

                            <Button
                                size="lg"
                                variant="ghost"
                                onClick={() => discardMutation.mutate()}
                                disabled={discardMutation.isPending}
                                className="h-12 w-12 rounded-full p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                title="Reset Session"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </Button>
                        </>
                    )}
                </div>

                <div className="text-[10px] text-muted-foreground/45 pt-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-muted/60 text-[9px] font-mono border border-border/40">Space</kbd> Start/Pause · <kbd className="px-1.5 py-0.5 rounded bg-muted/60 text-[9px] font-mono border border-border/40">Z</kbd> Zen Mode
                </div>
            </main>

            <footer className="w-full max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-full bg-card/60 backdrop-blur-xl border border-border/40 shadow-lg shrink-0">
                <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
                    <DialogTrigger asChild>
                        <button
                            type="button"
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-background/80 hover:bg-muted border border-border/40 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-all shadow-2xs"
                            title="View Today's Session History & Logs"
                        >
                            <Flame className="w-3.5 h-3.5 text-primary" />
                            <span className="font-mono font-bold text-foreground">
                                {todayHours > 0 ? `${todayHours}h ` : ""}{todayMins}m
                            </span>
                            <span className="text-[10px] text-muted-foreground">({sessionCount} sessions)</span>
                        </button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-md rounded-3xl p-6">
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold flex items-center gap-2">
                                <History className="w-4 h-4 text-primary" /> Today&apos;s Study Sessions
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-3 pt-2 max-h-80 overflow-y-auto pr-1">
                            <div className="flex items-center justify-between text-xs p-3 rounded-2xl bg-muted/50 border border-border/40">
                                <span className="font-semibold text-muted-foreground">Total Study Time</span>
                                <span className="font-mono font-black text-foreground text-sm">
                                    {todayHours > 0 ? `${todayHours}h ` : ""}{todayMins}m ({totalTodayMinutes} mins)
                                </span>
                            </div>

                            {timeLogsData?.data && timeLogsData.data.length > 0 ? (
                                <div className="space-y-2">
                                    {timeLogsData.data.map((log) => (
                                        <div
                                            key={log.id}
                                            className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/40 text-xs"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                                <span className="font-semibold text-foreground truncate">
                                                    {log.note || "Focus Study Session"}
                                                </span>
                                            </div>
                                            <span className="font-mono font-bold text-muted-foreground shrink-0 ml-2">
                                                {log.duration_minutes}m
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-xs text-muted-foreground">
                                    No study sessions recorded yet today.
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/80 border border-border/40 text-xs max-w-50 shadow-2xs">
                    <Target className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <Select
                        value={session?.taskId || selectedTaskId}
                        onValueChange={setSelectedTaskId}
                        disabled={isRunning || isPaused}
                    >
                        <SelectTrigger className="h-6 text-xs border-0 bg-transparent shadow-none px-0.5 font-medium truncate">
                            <SelectValue placeholder="Study Target..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl max-h-56">
                            {tasks.map((task) => (
                                <SelectItem key={task.id} value={task.id} className="text-xs">
                                    {task.title} {task.subject ? `(${task.subject})` : ""}
                                </SelectItem>
                            ))}
                            {tasks.length === 0 && (
                                <div className="p-3 text-xs text-muted-foreground text-center">
                                    No tasks found in tracker.
                                </div>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                <Dialog open={showOfflineModal} onOpenChange={setShowOfflineModal}>
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full gap-1.5 h-8 px-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Log Offline Study Time"
                        >
                            <PlusCircle className="w-3.5 h-3.5 text-primary" />
                            <span>Log Offline</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md rounded-3xl p-6">
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary" /> Log Offline Study Hours
                            </DialogTitle>
                        </DialogHeader>
                        <ManualTimeLogCard
                            hideHeader
                            onSuccess={() => setShowOfflineModal(false)}
                        />
                    </DialogContent>
                </Dialog>

                <AmbientSoundPlayer />

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsZenMode(true)}
                    className="rounded-full gap-1.5 h-8 px-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Enter Fullscreen Zen Mode [Z]"
                >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Zen</span>
                </Button>
            </footer>

            <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
                <DialogContent className="sm:max-w-md rounded-3xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            Record Study Session
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="p-3.5 rounded-2xl bg-muted/50 border border-border/50 text-xs space-y-1">
                            <div className="font-bold text-foreground">
                                {activeSelectedTask ? activeSelectedTask.title : "Study Session"}
                            </div>
                            <div className="text-muted-foreground">
                                Duration: <span className="font-bold text-primary">{Math.max(1, Math.round(elapsed / 60))} minutes</span>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground">
                                Session Notes (Optional)
                            </label>
                            <Textarea
                                value={logNote}
                                onChange={(e) => setLogNote(e.target.value)}
                                placeholder="What topics or chapters did you cover?"
                                className="resize-none text-xs rounded-xl min-h-20"
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex items-center justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowLogDialog(false)}
                            className="rounded-xl text-xs cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            disabled={stopMutation.isPending}
                            onClick={() => stopMutation.mutate(logNote)}
                            className="rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground px-5 cursor-pointer shadow-xs"
                        >
                            {stopMutation.isPending ? "Saving..." : "Save Time Log"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
