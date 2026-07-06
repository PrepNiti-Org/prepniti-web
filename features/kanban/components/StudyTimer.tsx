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
import { Play, Pause, RotateCcw, Save } from "lucide-react";
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
            <div className="flex items-center justify-center gap-3">
                {!isRunning ? (
                    <Button
                        size="sm"
                        onClick={elapsed > 0 ? handleResume : handleStart}
                        className="gap-2 rounded-full px-6 shadow-sm"
                    >
                        <Play className="h-4 w-4" />
                        {elapsed > 0 ? "Resume" : "Start"}
                    </Button>
                ) : (
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={handlePause}
                        className="gap-2 rounded-full px-6 shadow-sm"
                    >
                        <Pause className="h-4 w-4" />
                        Pause
                    </Button>
                )}

                {elapsed > 0 && (
                    <>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleReset}
                            className="gap-2 rounded-full"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Discard
                        </Button>
                        <Button
                            size="sm"
                            variant="default"
                            onClick={handleLog}
                            className="gap-2 rounded-full px-6 shadow-sm bg-green-600 hover:bg-green-700 text-white"
                        >
                            <Save className="h-4 w-4" />
                            Log
                        </Button>
                    </>
                )}
            </div>

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
                            {logMutation.isPending ? "Saving..." : "Save Session"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

