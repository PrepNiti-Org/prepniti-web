"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    getActiveSession,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    discardSession,
    SessionResponseData
} from "../api";
import {
    formatTime,
    getDisplayElapsed,
    dispatchSessionUpdate,
    ActiveSession
} from "../timerUtils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play, Pause, RotateCcw, Check } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

interface StudyTimerProps {
    taskId: string;
    taskTitle: string;
}

export function StudyTimer({ taskId, taskTitle }: StudyTimerProps) {
    const queryClient = useQueryClient();
    const [session, setSession] = useState<ActiveSession | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const [showLogDialog, setShowLogDialog] = useState(false);
    const [note, setNote] = useState("");
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const mapSessionData = (data: SessionResponseData | null): ActiveSession | null => {
        if (!data) return null;
        return {
            sessionId: data.id,
            taskId: data.task_id,
            taskTitle: data.task_title,
            startedAt: data.started_at ? new Date(data.started_at).getTime() : null,
            accumulatedSeconds: data.accumulated_seconds,
            isPaused: data.is_paused,
        };
    };

    const fetchSession = async () => {
        try {
            const data = await getActiveSession();
            const active = mapSessionData(data);
            setSession(active);
            if (active && active.taskId === taskId) {
                setElapsed(getDisplayElapsed(active));
            } else {
                setElapsed(0);
            }
        } catch {
            console.error("Failed to load active study session");
        }
    };

    useEffect(() => {
        fetchSession();

        const handleSessionUpdateEvent = (e: Event) => {
            const customEvent = e as CustomEvent<ActiveSession | null>;
            const newSession = customEvent.detail;
            setSession(newSession);
            if (newSession && newSession.taskId === taskId) {
                setElapsed(getDisplayElapsed(newSession));
            } else {
                setElapsed(0);
            }
        };

        window.addEventListener("session-update", handleSessionUpdateEvent);
        document.addEventListener("visibilitychange", fetchSession);

        return () => {
            window.removeEventListener("session-update", handleSessionUpdateEvent);
            document.removeEventListener("visibilitychange", fetchSession);
        };
    }, [taskId]);

    useEffect(() => {
        if (session && session.taskId === taskId && !session.isPaused) {
            intervalRef.current = setInterval(() => {
                setElapsed(getDisplayElapsed(session));
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (session && session.taskId === taskId) {
                setElapsed(session.accumulatedSeconds);
            }
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [session, taskId]);

    const handleStart = async () => {
        try {
            const data = await startSession(taskId);
            const active = mapSessionData(data);
            setSession(active);
            dispatchSessionUpdate(active);
            toast.success("Timer started!");
        } catch (err: any) {
            if (err?.response?.status === 409) {
                toast.error(err?.response?.data?.error || "A session is already active.");
            } else {
                toast.error("Failed to start timer");
            }
        }
    };

    const handlePause = async () => {
        try {
            const data = await pauseSession();
            const active = mapSessionData(data);
            setSession(active);
            dispatchSessionUpdate(active);
            toast.info("Timer paused");
        } catch (err: any) {
            toast.error(err?.response?.data?.error || "Failed to pause timer");
        }
    };

    const handleResume = async () => {
        try {
            const data = await resumeSession();
            const active = mapSessionData(data);
            setSession(active);
            dispatchSessionUpdate(active);
            toast.info("Timer resumed");
        } catch (err: any) {
            toast.error(err?.response?.data?.error || "Failed to resume timer");
        }
    };

    const handleReset = async () => {
        try {
            await discardSession();
            setSession(null);
            dispatchSessionUpdate(null);
            toast.info("Study session discarded");
        } catch (err: any) {
            toast.error(err?.response?.data?.error || "Failed to discard session");
        }
    };

    const handleLog = () => {
        if (!session) return;
        const currentElapsed = getDisplayElapsed(session);
        if (currentElapsed < 60) {
            toast.error("Session must be at least 1 minute long to log");
            return;
        }
        setShowLogDialog(true);
    };

    const logMutation = useMutation({
        mutationFn: (noteText: string) => stopSession(noteText),
        onSuccess: () => {
            toast.success("Study session logged!");
            queryClient.invalidateQueries({ queryKey: ["taskTimeLogs", taskId] });
            queryClient.invalidateQueries({ queryKey: ["userTimeLogs"] });
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            setSession(null);
            dispatchSessionUpdate(null);
            setShowLogDialog(false);
            setNote("");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.error || "Failed to log session");
        },
    });

    const confirmLog = () => {
        logMutation.mutate(note.trim());
    };

    const isRunning = session && session.taskId === taskId && !session.isPaused;
    const hasSession = session !== null;
    const isThisTaskSession = session && session.taskId === taskId;
    const durationMinutes = Math.max(1, Math.round(elapsed / 60));

    if (hasSession && !isThisTaskSession) {
        return (
            <div className="rounded-lg border border-dashed p-4 text-center space-y-2 bg-muted/30">
                <p className="text-xs text-muted-foreground">
                    You have an active timer running for another target:
                </p>
                <p className="text-xs font-semibold text-foreground truncate max-w-[280px] mx-auto">
                    "{session.taskTitle}"
                </p>
                <p className="text-[11px] text-muted-foreground">
                    Stop or discard it from the navbar timer to track effort here.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Timer Display */}
            <div className="text-center">
                <div className="text-4xl font-mono font-bold tracking-wider tabular-nums text-foreground">
                    {formatTime(elapsed)}
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px] mx-auto">
                    {isRunning ? `Studying: ${taskTitle}` : elapsed > 0 ? "Paused" : "Ready to study"}
                </p>
            </div>

            {/* Controls */}
            {elapsed > 0 ? (
                <div className="grid grid-cols-3 gap-2.5 w-full max-w-[340px] mx-auto">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleReset}
                        className="rounded-xl h-9 text-xs font-semibold bg-destructive/10 hover:bg-destructive/20 text-destructive border-none shadow-sm cursor-pointer w-full"
                    >
                        <RotateCcw className="h-3.5 w-3.5 mr-1" />
                        Discard
                    </Button>

                    <Button
                        size="sm"
                        variant={isRunning ? "secondary" : "default"}
                        onClick={!isRunning ? handleResume : handlePause}
                        className="rounded-xl h-9 text-xs font-semibold cursor-pointer transition-all duration-200 w-full"
                    >
                        {!isRunning ? (
                            <>
                                <Play className="h-3.5 w-3.5 mr-1 fill-current" />
                                Resume
                            </>
                        ) : (
                            <>
                                <Pause className="h-3.5 w-3.5 mr-1 fill-current" />
                                Pause
                            </>
                        )}
                    </Button>

                    <Button
                        size="sm"
                        onClick={handleLog}
                        className="rounded-xl h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white border-none shadow-sm cursor-pointer w-full"
                    >
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Stop &amp; Log
                    </Button>
                </div>
            ) : (
                <div className="flex justify-center w-full">
                    <Button
                        size="sm"
                        onClick={handleStart}
                        className="rounded-xl h-9 text-xs font-semibold cursor-pointer w-[140px]"
                    >
                        <Play className="h-3.5 w-3.5 mr-1 fill-current" />
                        Start
                    </Button>
                </div>
            )}

            {/* Log Confirmation Dialog */}
            <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Log Study Session</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="text-center">
                            <div className="text-3xl font-mono font-bold">{formatTime(elapsed)}</div>
                            <p className="text-sm text-muted-foreground mt-1">
                                ≈ {durationMinutes} minute{durationMinutes !== 1 ? "s" : ""} — {taskTitle}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Note (optional)</label>
                            <Textarea
                                placeholder="What did you cover in this session?"
                                className="min-h-[80px] resize-none"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowLogDialog(false)}>Cancel</Button>
                        <Button
                            onClick={confirmLog}
                            disabled={logMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {logMutation.isPending ? "Logging..." : "Log Session"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

