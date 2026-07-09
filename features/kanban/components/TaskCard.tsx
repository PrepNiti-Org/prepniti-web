"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task, getTaskTimeLogs, startSession, pauseSession, resumeSession, getActiveSession } from "../api";
import { Clock, CalendarDays, BookOpen, PenTool, Target, BrainCircuit, Timer, Play, Pause, Loader2 } from "lucide-react";
import { dispatchSessionUpdate, ActiveSession } from "../timerUtils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const TypeIcon = ({ type }: { type: string }) => {
    switch (type) {
        case "READING": return <BookOpen className="w-3 h-3" />;
        case "PRACTICE": return <PenTool className="w-3 h-3" />;
        case "MOCK_TEST": return <Target className="w-3 h-3 text-red-500" />;
        case "REVISION": return <BrainCircuit className="w-3 h-3 text-purple-500" />;
        default: return null;
    }
};

export function TaskCard({ 
    task, 
    onSelectTask, 
    isCurrentlySelected 
}: { 
    task: Task; 
    onSelectTask: (t: Task) => void; 
    isCurrentlySelected: boolean; 
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: String(task.id) });

    const [session, setSession] = useState<ActiveSession | null>(null);
    const [isPending, setIsPending] = useState(false);

    const mapSessionData = (data: any): ActiveSession | null => {
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

    useEffect(() => {
        const checkActive = async () => {
            try {
                const activeData = await getActiveSession();
                setSession(mapSessionData(activeData));
            } catch (err) {
                console.error("Failed to load active study session", err);
            }
        };
        checkActive();

        const handleUpdate = (e: Event) => {
            const customEvent = e as CustomEvent<ActiveSession | null>;
            setSession(customEvent.detail);
        };
        window.addEventListener("session-update", handleUpdate);
        return () => window.removeEventListener("session-update", handleUpdate);
    }, []);

    const isCurrentSession = session !== null && session.taskId === task.id;
    const isRunning = isCurrentSession && !session.isPaused;
    const hasSession = session !== null;

    const handleTimerClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isPending) return;

        setIsPending(true);
        try {
            if (isCurrentSession) {
                if (isRunning) {
                    const data = await pauseSession();
                    const active = mapSessionData(data);
                    setSession(active);
                    dispatchSessionUpdate(active);
                    toast.info("Timer paused");
                } else {
                    const data = await resumeSession();
                    const active = mapSessionData(data);
                    setSession(active);
                    dispatchSessionUpdate(active);
                    toast.info("Timer resumed");
                }
            } else {
                if (hasSession) {
                    toast.error(`A timer is already running for "${session.taskTitle}". Pause or log it first.`);
                    setIsPending(false);
                    return;
                }
                const data = await startSession(task.id);
                const active = mapSessionData(data);
                setSession(active);
                dispatchSessionUpdate(active);
                toast.success("Timer started!");
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.error || "Failed to update timer");
        } finally {
            setIsPending(false);
        }
    };

    const { data: timeLogData } = useQuery({
        queryKey: ["taskTimeLogs", task.id],
        queryFn: () => getTaskTimeLogs(task.id),
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : "auto",
    };

    const isOverdue = task.target_date && new Date(task.target_date) < new Date() && task.status !== "DONE";
    const loggedMinutes = timeLogData?.total_minutes || 0;
    const loggedHours = (loggedMinutes / 60).toFixed(1);

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-3 touch-none cursor-grab active:cursor-grabbing group">
            <Card 
                className={`p-3 transition-all cursor-pointer ${
                    isCurrentlySelected 
                        ? "shadow-md border-primary ring-2 ring-primary bg-primary/5" 
                        : "shadow-sm hover:border-primary/50"
                } ${isOverdue ? "border-red-500/50 bg-red-50/50 dark:bg-red-950/10" : ""} ${
                    isCurrentSession
                        ? isRunning
                            ? "border-green-500 ring-1 ring-green-500 bg-green-500/[0.02]"
                            : "border-amber-500 ring-1 ring-amber-500 bg-amber-500/[0.02]"
                        : ""
                }`} 
                onClick={() => !isDragging && onSelectTask(task)}
            >

                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                        {task.subject && <Badge variant="secondary" className="text-[10px] px-1.5 rounded-sm">{task.subject}</Badge>}
                        {task.type && <div className="text-muted-foreground" title={task.type}><TypeIcon type={task.type} /></div>}
                    </div>
                    <div className="flex items-center gap-2">
                        {task.priority === "HIGH" && <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">High</span>}
                        <TooltipProvider delayDuration={200}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={handleTimerClick}
                                        disabled={isPending}
                                        className={`p-1 rounded-full border transition-all cursor-pointer ${
                                            isCurrentSession
                                                ? isRunning
                                                    ? "bg-green-500/10 border-green-500/30 text-green-500 hover:bg-green-500/20 animate-pulse"
                                                    : "bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20"
                                                : "bg-muted border-border text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted-foreground hover:text-background"
                                        }`}
                                    >
                                        {isPending ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : isCurrentSession && isRunning ? (
                                            <Pause className="w-3 h-3 fill-current" />
                                        ) : (
                                            <Play className="w-3 h-3 fill-current" />
                                        )}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" align="center">
                                    {isCurrentSession ? (isRunning ? "Pause Session" : "Resume Session") : "Start Session"}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                <h4 className="font-medium text-sm leading-tight text-foreground/90">{task.title}</h4>
                {task.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{task.description}</p>}

                {(task.estimated_hours || task.target_date || loggedMinutes > 0) && (
                    <div className="flex items-center gap-3 mt-3 pt-2 border-t border-border/50 text-[10px] text-muted-foreground">
                        {(task.estimated_hours || loggedMinutes > 0) && (
                            <span className="flex items-center gap-1">
                                <Timer className="w-3 h-3 text-green-500" />
                                {loggedHours}h{task.estimated_hours ? ` / ${task.estimated_hours}h` : ""}
                            </span>
                        )}
                        {task.target_date && (
                            <span className={`flex items-center gap-1 ${isOverdue ? "text-red-500 font-medium" : ""}`}>
                                <CalendarDays className="w-3 h-3" />
                                {new Date(task.target_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                        )}
                    </div>
                )}

            </Card>
        </div>
    );
}