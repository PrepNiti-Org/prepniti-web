"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createTimeLog } from "@/features/kanban/api";
import { getStoredTimer, storeTimer, formatTime, dispatchTimerUpdate, TimerState } from "@/features/kanban/timerUtils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play, Pause, Square, Save, Timer } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export function NavbarTimer() {
    const queryClient = useQueryClient();
    const [timerState, setTimerState] = useState<TimerState | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const [showLogDialog, setShowLogDialog] = useState(false);
    const [note, setNote] = useState("");
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Sync from localStorage + listen for cross-component events
    const syncFromStorage = () => {
        const stored = getStoredTimer();
        setTimerState(stored);
        if (stored) {
            if (stored.isRunning && stored.startedAt) {
                const additionalSeconds = Math.floor((Date.now() - stored.startedAt) / 1000);
                setElapsed(stored.elapsed + additionalSeconds);
            } else {
                setElapsed(stored.elapsed);
            }
        } else {
            setElapsed(0);
        }
    };

    useEffect(() => {
        syncFromStorage();
        window.addEventListener("timer-update", syncFromStorage);
        return () => window.removeEventListener("timer-update", syncFromStorage);
    }, []);

    // Tick every second when running
    useEffect(() => {
        if (timerState?.isRunning) {
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
    }, [timerState?.isRunning]);

    const handlePause = () => {
        if (!timerState) return;
        storeTimer({ ...timerState, elapsed, isRunning: false, startedAt: null });
        dispatchTimerUpdate();
    };

    const handleResume = () => {
        if (!timerState) return;
        storeTimer({ ...timerState, elapsed, isRunning: true, startedAt: Date.now() });
        dispatchTimerUpdate();
    };

    const handleStop = () => {
        if (!timerState) return;
        if (elapsed < 60) {
            storeTimer(null);
            dispatchTimerUpdate();
            toast.info("Timer discarded (less than 1 minute)");
            return;
        }
        // Pause and show log dialog
        storeTimer({ ...timerState, elapsed, isRunning: false, startedAt: null });
        dispatchTimerUpdate();
        setShowLogDialog(true);
    };

    const handleDiscard = () => {
        storeTimer(null);
        dispatchTimerUpdate();
        toast.info("Timer discarded");
    };

    const logMutation = useMutation({
        mutationFn: (data: { duration_minutes: number; note?: string }) =>
            createTimeLog(timerState!.taskId, data),
        onSuccess: () => {
            toast.success("Study session logged!");
            queryClient.invalidateQueries({ queryKey: ["taskTimeLogs", timerState?.taskId] });
            queryClient.invalidateQueries({ queryKey: ["userTimeLogs"] });
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            storeTimer(null);
            dispatchTimerUpdate();
            setShowLogDialog(false);
            setNote("");
        },
        onError: () => {
            toast.error("Failed to log session");
        },
    });

    const confirmLog = () => {
        const durationMinutes = Math.max(1, Math.round(elapsed / 60));
        logMutation.mutate({ duration_minutes: durationMinutes, note: note.trim() || undefined });
    };

    const isRunning = timerState?.isRunning || false;
    const hasTimer = timerState !== null;
    const durationMinutes = Math.round(elapsed / 60);

    if (!hasTimer) return null;

    return (
        <>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`flex items-center gap-1.5 px-2.5 py-1 h-7 rounded-full text-xs font-mono font-semibold tabular-nums transition-all border ${isRunning
                            ? "bg-green-500/10 border-green-500/30 text-green-500 hover:bg-green-500/20 animate-pulse"
                            : "bg-muted/50 border-border text-muted-foreground hover:bg-muted"
                            }`}
                    >
                        <Timer className="h-3.5 w-3.5" />
                        {formatTime(elapsed)}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-3" align="end" sideOffset={12}>
                    <div className="space-y-3">
                        <div className="text-center">
                            <div className="text-2xl font-mono font-bold tabular-nums">{formatTime(elapsed)}</div>
                            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                                {timerState?.taskTitle || "Study session"}
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            {isRunning ? (
                                <Button size="sm" variant="secondary" onClick={handlePause} className="gap-1.5 rounded-full h-8 text-xs">
                                    <Pause className="h-3.5 w-3.5" /> Pause
                                </Button>
                            ) : (
                                <Button size="sm" onClick={handleResume} className="gap-1.5 rounded-full h-8 text-xs">
                                    <Play className="h-3.5 w-3.5" /> Resume
                                </Button>
                            )}
                            <Button size="sm" variant="default" onClick={handleStop} className="gap-1.5 rounded-full h-8 text-xs bg-green-600 hover:bg-green-700 text-white">
                                <Save className="h-3.5 w-3.5" /> Log
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleDiscard} className="gap-1.5 rounded-full h-8 text-xs text-destructive hover:text-destructive">
                                <Square className="h-3.5 w-3.5" /> Discard
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

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
                                ≈ {durationMinutes} minute{durationMinutes !== 1 ? "s" : ""} — {timerState?.taskTitle}
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
        </>
    );
}
