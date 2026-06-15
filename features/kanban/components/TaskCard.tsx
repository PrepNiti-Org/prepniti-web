"use client";

import { useQuery } from "@tanstack/react-query";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task, getTaskTimeLogs } from "../api";
import { Clock, CalendarDays, BookOpen, PenTool, Target, BrainCircuit, Timer } from "lucide-react";

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
                } ${isOverdue ? "border-red-500/50 bg-red-50/50 dark:bg-red-950/10" : ""}`} 
                onClick={() => !isDragging && onSelectTask(task)}
            >

                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                        {task.subject && <Badge variant="secondary" className="text-[10px] px-1.5 rounded-sm">{task.subject}</Badge>}
                        {task.type && <div className="text-muted-foreground" title={task.type}><TypeIcon type={task.type} /></div>}
                    </div>
                    {task.priority === "HIGH" && <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">High</span>}
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