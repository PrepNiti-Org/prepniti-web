"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Task, Priority, Status, updateTask, deleteTask, getTaskTimeLogs, deleteTimeLog, TimeLog } from "../api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, Save, Calendar, AlertTriangle, Clock, Flame, X, BookOpen, PenTool, Target, BrainCircuit, ChevronDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function TaskDetailsPanel({
    task,
    onClose,
    showCloseButton = true
}: {
    task: Task;
    onClose: () => void;
    showCloseButton?: boolean;
}) {
    const queryClient = useQueryClient();
    const [showLogs, setShowLogs] = useState(false);

    const formatDateForInput = (dateString?: string) => {
        if (!dateString) return "";
        return new Date(dateString).toISOString().split("T")[0];
    };

    const [form, setForm] = useState(() => ({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        subject: task.subject || "",
        type: task.type || "READING",
        status: task.status,
        estimated_hours: task.estimated_hours ? String(task.estimated_hours) : "",
        target_date: formatDateForInput(task.target_date),
    }));

    const { data: timeLogData } = useQuery({
        queryKey: ["taskTimeLogs", task.id],
        queryFn: () => getTaskTimeLogs(task.id),
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<Task>) => updateTask({ id: task.id, data }),
        onSuccess: () => {
            toast.success("Target updated");
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteTask(task.id),
        onSuccess: () => {
            toast.success("Target deleted");
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            onClose();
        }
    });

    const deleteLogMutation = useMutation({
        mutationFn: (logId: string) => deleteTimeLog(logId),
        onSuccess: () => {
            toast.success("Time log deleted");
            queryClient.invalidateQueries({ queryKey: ["taskTimeLogs", task.id] });
            queryClient.invalidateQueries({ queryKey: ["userTimeLogs"] });
        }
    });

    const handleSave = () => {
        updateMutation.mutate({
            ...form,
            estimated_hours: form.estimated_hours ? parseInt(form.estimated_hours) : undefined,
            target_date: form.target_date ? new Date(form.target_date).toISOString() : undefined,
        });
    };

    const totalLoggedMinutes = timeLogData?.total_minutes || 0;
    const totalLoggedHours = (totalLoggedMinutes / 60).toFixed(1);
    const estimatedHours = task.estimated_hours || 0;
    const progressPercent = estimatedHours > 0 ? Math.min(100, Math.round((totalLoggedMinutes / (estimatedHours * 60)) * 100)) : 0;
    const timeLogs = timeLogData?.data || [];

    return (
        <TooltipProvider delayDuration={200}>
            <div className="flex flex-col h-full bg-transparent border-none rounded-none shadow-none p-4 sm:p-5 overflow-hidden">
                <div className="flex items-center justify-between border-b pb-3 mb-4 shrink-0">
                    <h3 className="font-bold text-base text-foreground tracking-tight">Target Details</h3>
                    <div className="flex items-center gap-1.5">
                        <Link href={`/focus?taskId=${task.id}`}>
                            <Button
                                size="sm"
                                className="h-8 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white gap-1.5 shadow-xs"
                            >
                                <Flame className="h-3.5 w-3.5" />
                                <span>Start Focus</span>
                            </Button>
                        </Link>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                disabled={deleteMutation.isPending} 
                                                className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                            >
                                                {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="rounded-2xl">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="flex items-center gap-2 text-destructive font-bold text-base">
                                                    <AlertTriangle className="w-5 h-5" /> Delete this target?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription className="text-sm">
                                                    Are you sure you want to permanently delete <strong>&quot;{task.title}&quot;</strong>? This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="cursor-pointer rounded-xl text-xs h-9">Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer rounded-xl text-xs h-9"
                                                    onClick={() => deleteMutation.mutate()}
                                                >
                                                    Yes, delete it
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>Delete Target</TooltipContent>
                        </Tooltip>

                        {showCloseButton && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={onClose}
                                        className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Close Panel</TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-4 pb-4">
                    <div className="bg-muted/30 rounded-2xl p-3.5 border border-border/50 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold flex items-center gap-1.5 text-muted-foreground">
                                <Clock className="h-3.5 w-3.5 text-primary" /> Study Time Progress
                            </span>
                            <span className="font-bold text-foreground">
                                {totalLoggedHours}h logged {estimatedHours > 0 ? `/ ${estimatedHours}h est.` : ""}
                            </span>
                        </div>
                        {estimatedHours > 0 && (
                            <Progress value={progressPercent} className="h-2 rounded-full" />
                        )}
                    </div>

                    <div className="space-y-3.5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Target Title</label>
                            <Input
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                className="h-9 text-xs font-semibold rounded-xl"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Subject</label>
                                <Input
                                    value={form.subject}
                                    onChange={e => setForm({ ...form, subject: e.target.value })}
                                    className="h-9 text-xs rounded-xl"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Task Type</label>
                                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                                    <SelectTrigger className="h-9 text-xs rounded-xl"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="READING" className="text-xs">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                                                <span>Reading</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="PRACTICE" className="text-xs">
                                            <div className="flex items-center gap-2">
                                                <PenTool className="w-3.5 h-3.5 text-muted-foreground" />
                                                <span>Practice</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="MOCK_TEST" className="text-xs">
                                            <div className="flex items-center gap-2">
                                                <Target className="w-3.5 h-3.5 text-red-500" />
                                                <span>Mock Test</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="REVISION" className="text-xs">
                                            <div className="flex items-center gap-2">
                                                <BrainCircuit className="w-3.5 h-3.5 text-purple-500" />
                                                <span>Revision</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</label>
                                <Select value={form.status} onValueChange={(v: Status) => setForm({ ...form, status: v })}>
                                    <SelectTrigger className="h-9 text-xs rounded-xl"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="TODO" className="text-xs">To Study</SelectItem>
                                        <SelectItem value="IN_PROGRESS" className="text-xs">In Progress</SelectItem>
                                        <SelectItem value="DONE" className="text-xs">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Priority</label>
                                <Select value={form.priority} onValueChange={(v: Priority) => setForm({ ...form, priority: v })}>
                                    <SelectTrigger className="h-9 text-xs rounded-xl"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="HIGH" className="text-xs font-semibold text-red-500">High</SelectItem>
                                        <SelectItem value="MEDIUM" className="text-xs font-semibold text-amber-500">Medium</SelectItem>
                                        <SelectItem value="LOW" className="text-xs font-semibold text-blue-500">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Est. Hours</label>
                                <Input
                                    type="number"
                                    value={form.estimated_hours}
                                    onChange={e => setForm({ ...form, estimated_hours: e.target.value })}
                                    className="h-9 text-xs rounded-xl"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Target Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        type="date"
                                        className="pl-9 h-9 text-xs rounded-xl"
                                        value={form.target_date}
                                        onChange={e => setForm({ ...form, target_date: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Notes / Syllabus</label>
                            <Textarea
                                className="min-h-20 text-xs rounded-xl resize-none"
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                placeholder="Add syllabus topics, chapter references or revision notes..."
                            />
                        </div>

                        {timeLogs.length > 0 && (
                            <div className="pt-2 border-t border-border/40 space-y-2">
                                <button
                                    type="button"
                                    onClick={() => setShowLogs(!showLogs)}
                                    className="flex items-center justify-between w-full text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                >
                                    <span>Past Session Logs ({timeLogs.length})</span>
                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showLogs ? "rotate-180" : ""}`} />
                                </button>

                                {showLogs && (
                                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                        {timeLogs.map((log: TimeLog) => (
                                            <div key={log.id} className="flex items-center justify-between p-2 rounded-xl bg-card border text-xs">
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-foreground">
                                                        {log.duration_minutes}m
                                                        <span className="text-[10px] font-normal text-muted-foreground ml-2">
                                                            {formatDistanceToNow(new Date(log.logged_at), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                    {log.note && (
                                                        <p className="text-[10px] text-muted-foreground truncate">{log.note}</p>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 rounded-lg text-muted-foreground hover:text-destructive cursor-pointer"
                                                    onClick={() => deleteLogMutation.mutate(log.id)}
                                                    disabled={deleteLogMutation.isPending}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-border/50 pt-3 bg-transparent shrink-0">
                    <Button variant="ghost" size="sm" onClick={onClose} className="cursor-pointer rounded-xl h-8 text-xs">
                        Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending} className="cursor-pointer rounded-xl h-8 text-xs font-semibold bg-primary hover:bg-primary/90 text-white px-4">
                        {updateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Save className="w-3.5 h-3.5 mr-1" /> Save Target</>}
                    </Button>
                </div>
            </div>
        </TooltipProvider>
    );
}
