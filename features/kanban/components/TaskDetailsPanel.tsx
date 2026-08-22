"use client";

import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Task, Priority, Status, updateTask, deleteTask, getTaskTimeLogs, deleteTimeLog, TimeLog } from "../api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, Calendar, AlertTriangle, Clock, BookOpen, PenTool, Target, BrainCircuit, ChevronDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
            toast.success("Target updated!");
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            onClose();
        },
        onError: (error: unknown) => {
            const msg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to update target";
            toast.error(msg);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteTask(task.id),
        onSuccess: () => {
            toast.success("Target deleted");
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            onClose();
        },
        onError: (error: unknown) => {
            const msg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to delete target";
            toast.error(msg);
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

    const handleSave = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!form.title.trim()) return toast.error("Title is required");

        updateMutation.mutate({
            ...form,
            title: form.title.trim(),
            subject: form.subject.trim(),
            estimated_hours: form.estimated_hours ? parseInt(form.estimated_hours, 10) : undefined,
            target_date: form.target_date ? new Date(form.target_date).toISOString() : undefined,
            description: form.description.trim(),
        });
    };

    const totalLoggedMinutes = timeLogData?.total_minutes || 0;
    const totalLoggedHours = (totalLoggedMinutes / 60).toFixed(1);
    const estimatedHours = task.estimated_hours || 0;
    const progressPercent = estimatedHours > 0 ? Math.min(100, Math.round((totalLoggedMinutes / (estimatedHours * 60)) * 100)) : 0;
    const timeLogs = timeLogData?.data || [];

    return (
        <div className="flex flex-col h-full bg-transparent p-0">
            <div className="border-b border-border/40 pb-2 mb-4 shrink-0">
                <h3 className="font-bold text-lg text-foreground tracking-tight flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" /> Edit Target Details
                </h3>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
                <div className="bg-card border border-border/60 rounded-xl p-3 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            <span>Study Progress</span>
                        </span>
                        <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                            {progressPercent}%
                        </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden relative">
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                        <span>{totalLoggedHours}h logged</span>
                        <span>{estimatedHours > 0 ? `${estimatedHours}h estimated` : "No estimate"}</span>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Title *</label>
                    <Input
                        placeholder="What do you need to accomplish?"
                        className="h-10 text-sm"
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        autoFocus
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Subject</label>
                        <Input
                            placeholder="e.g. History"
                            className="h-10 text-sm"
                            value={form.subject}
                            onChange={e => setForm({ ...form, subject: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Task Type</label>
                        <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                            <SelectTrigger className="h-10 text-sm w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="READING" className="text-sm py-2">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                                        <span>Reading</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="PRACTICE" className="text-sm py-2">
                                    <div className="flex items-center gap-2">
                                        <PenTool className="w-4 h-4 text-muted-foreground" />
                                        <span>Practice</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="MOCK_TEST" className="text-sm py-2">
                                    <div className="flex items-center gap-2">
                                        <Target className="w-4 h-4 text-red-500" />
                                        <span>Mock Test</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="REVISION" className="text-sm py-2">
                                    <div className="flex items-center gap-2">
                                        <BrainCircuit className="w-4 h-4 text-purple-500" />
                                        <span>Revision</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Status</label>
                        <Select value={form.status} onValueChange={(v: Status) => setForm({ ...form, status: v })}>
                            <SelectTrigger className="h-10 text-sm w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TODO" className="text-sm py-2">To Study</SelectItem>
                                <SelectItem value="IN_PROGRESS" className="text-sm py-2">In Revision</SelectItem>
                                <SelectItem value="DONE" className="text-sm py-2">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Priority</label>
                        <Select value={form.priority} onValueChange={(v: Priority) => setForm({ ...form, priority: v })}>
                            <SelectTrigger className="h-10 text-sm w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="HIGH" className="text-sm py-2">High</SelectItem>
                                <SelectItem value="MEDIUM" className="text-sm py-2">Medium</SelectItem>
                                <SelectItem value="LOW" className="text-sm py-2">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground truncate">Est. Hours</label>
                        <Input
                            type="number"
                            min="0"
                            placeholder="e.g. 2"
                            className="h-10 text-sm"
                            value={form.estimated_hours}
                            onChange={e => setForm({ ...form, estimated_hours: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Target Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            type="date"
                            className="pl-9 h-10 text-sm"
                            value={form.target_date}
                            onChange={e => setForm({ ...form, target_date: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Description & Notes</label>
                    <Textarea
                        className="min-h-20 text-sm resize-none"
                        placeholder="Add links, page numbers, or study notes..."
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        rows={3}
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
                                    <div key={log.id} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border/40 text-xs">
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
                                            type="button"
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

                <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button 
                                type="button"
                                variant="ghost" 
                                size="sm" 
                                disabled={deleteMutation.isPending} 
                                className="h-9 px-3 text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer gap-1.5"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete Target</span>
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

                    <div className="flex items-center gap-2.5">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-9 px-4 text-xs font-semibold cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateMutation.isPending}
                            size="sm"
                            className="h-9 px-5 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl cursor-pointer shadow-xs"
                        >
                            {updateMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                            <span>Save Changes</span>
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
