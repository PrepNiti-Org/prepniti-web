"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    getActiveSession,
    pauseSession,
    resumeSession,
    stopSession,
    discardSession,
    SessionResponseData
} from "@/features/kanban/api";
import {
    formatTime,
    getDisplayElapsed,
    dispatchSessionUpdate,
    ActiveSession
} from "@/features/kanban/timerUtils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play, Pause, RotateCcw, Check, Timer } from "lucide-react";
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
            if (active) {
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
            if (newSession) {
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
    }, []);

    useEffect(() => {
        if (session && !session.isPaused) {
            intervalRef.current = setInterval(() => {
                setElapsed(getDisplayElapsed(session));
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (session) {
                setElapsed(session.accumulatedSeconds);
            }
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [session]);

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

    const handleStop = () => {
        if (!session) return;
        const currentElapsed = getDisplayElapsed(session);
        if (currentElapsed < 60) {
            toast.error("Session must be at least 1 minute long to log");
            return;
        }
        setShowLogDialog(true);
    };

    const handleDiscard = async () => {
        try {
            await discardSession();
            setSession(null);
            dispatchSessionUpdate(null);
            toast.info("Study session discarded");
        } catch (err: any) {
            toast.error(err?.response?.data?.error || "Failed to discard session");
        }
    };

    const logMutation = useMutation({
        mutationFn: (noteText: string) => stopSession(noteText),
        onSuccess: () => {
            toast.success("Study session logged!");
            queryClient.invalidateQueries({ queryKey: ["taskTimeLogs", session?.taskId] });
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

    const isRunning = session && !session.isPaused;
    const hasSession = session !== null;
    const durationMinutes = Math.max(1, Math.round(elapsed / 60));

    if (!hasSession) return null;

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
                                {session?.taskTitle || "Study session"}
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 w-full">
                            <Button
                                size="sm"
                                onClick={handleDiscard}
                                className="rounded-xl h-8 text-[11px] font-semibold bg-destructive/10 hover:bg-destructive/20 text-destructive border-none shadow-sm cursor-pointer w-full"
                            >
                                <RotateCcw className="h-3.5 w-3.5 mr-0.5" /> Discard
                            </Button>

                            {isRunning ? (
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={handlePause}
                                    className="rounded-xl h-8 text-[11px] font-semibold cursor-pointer w-full"
                                >
                                    <Pause className="h-3.5 w-3.5 mr-0.5" /> Pause
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    onClick={handleResume}
                                    className="rounded-xl h-8 text-[11px] font-semibold cursor-pointer w-full"
                                >
                                    <Play className="h-3.5 w-3.5 mr-0.5 fill-current" /> Resume
                                </Button>
                            )}

                            <Button
                                size="sm"
                                onClick={handleStop}
                                className="rounded-xl h-8 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-sm cursor-pointer w-full"
                            >
                                <Check className="h-3.5 w-3.5 mr-0.5" /> Log
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
                                ≈ {durationMinutes} minute{durationMinutes !== 1 ? "s" : ""} — {session?.taskTitle}
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
                        <Button variant="ghost" className="rounded-xl text-xs h-9 cursor-pointer" onClick={() => setShowLogDialog(false)}>Cancel</Button>
                        <Button
                            onClick={confirmLog}
                            disabled={logMutation.isPending}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs h-9 font-semibold cursor-pointer"
                        >
                            {logMutation.isPending ? "Logging..." : "Log Session"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

