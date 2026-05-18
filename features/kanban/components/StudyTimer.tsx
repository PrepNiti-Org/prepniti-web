"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createTimeLog } from "../api";
import { getStoredTimer, storeTimer, formatTime, dispatchTimerUpdate } from "../timerUtils";
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
    const [elapsed, setElapsed] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [showLogDialog, setShowLogDialog] = useState(false);
    const [note, setNote] = useState("");
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Restore timer state on mount
    useEffect(() => {
        const stored = getStoredTimer();
        if (stored && stored.taskId === taskId) {
            if (stored.isRunning && stored.startedAt) {
                const now = Date.now();
                const additionalSeconds = Math.floor((now - stored.startedAt) / 1000);
                setElapsed(stored.elapsed + additionalSeconds);
                setIsRunning(true);
            } else {
                setElapsed(stored.elapsed);
                setIsRunning(false);
            }
        }
    }, [taskId]);

    // Listen for external timer updates (from NavbarTimer)
    useEffect(() => {
        const handleExternalUpdate = () => {
            const stored = getStoredTimer();
            if (!stored || stored.taskId !== taskId) {
                setElapsed(0);
                setIsRunning(false);
            } else {
                if (stored.isRunning && stored.startedAt) {
                    const additionalSeconds = Math.floor((Date.now() - stored.startedAt) / 1000);
                    setElapsed(stored.elapsed + additionalSeconds);
                    setIsRunning(true);
                } else {
                    setElapsed(stored.elapsed);
                    setIsRunning(stored.isRunning);
                }
            }
        };
        window.addEventListener("timer-update", handleExternalUpdate);
        return () => window.removeEventListener("timer-update", handleExternalUpdate);
    }, [taskId]);

    // Persist timer state
    const persistState = useCallback((running: boolean, currentElapsed: number) => {
        storeTimer({
            taskId,
            taskTitle,
            elapsed: currentElapsed,
            isRunning: running,
            startedAt: running ? Date.now() : null,
        });
        dispatchTimerUpdate();
    }, [taskId, taskTitle]);

    // Timer interval
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setElapsed(prev => prev + 1);
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning]);

    // Persist on state changes
    useEffect(() => {
        persistState(isRunning, elapsed);
    }, [isRunning, elapsed, persistState]);

    const handleStart = () => setIsRunning(true);
    const handlePause = () => setIsRunning(false);
    const handleReset = () => {
        setIsRunning(false);
        setElapsed(0);
        storeTimer(null);
        dispatchTimerUpdate();
    };

    const logMutation = useMutation({
        mutationFn: (data: { duration_minutes: number; note?: string }) => createTimeLog(taskId, data),
        onSuccess: () => {
            toast.success("Study session logged!");
            queryClient.invalidateQueries({ queryKey: ["taskTimeLogs", taskId] });
            queryClient.invalidateQueries({ queryKey: ["userTimeLogs"] });
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            handleReset();
            setShowLogDialog(false);
            setNote("");
        },
        onError: () => {
            toast.error("Failed to log session");
        },
    });

    const handleLog = () => {
        if (elapsed < 60) {
            toast.error("Session must be at least 1 minute");
            return;
        }
        setIsRunning(false);
        setShowLogDialog(true);
    };

    const confirmLog = () => {
        const durationMinutes = Math.max(1, Math.round(elapsed / 60));
        logMutation.mutate({ duration_minutes: durationMinutes, note: note.trim() || undefined });
    };

    const durationMinutes = Math.round(elapsed / 60);

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
                        onClick={handleStart}
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
                            Reset
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
                                ≈ {durationMinutes} minute{durationMinutes !== 1 ? "s" : ""}
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
