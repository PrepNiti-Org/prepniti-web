"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Task, Priority, Status, updateTask, deleteTask, getTaskTimeLogs, deleteTimeLog, TimeLog } from "../api";
import { StudyTimer } from "./StudyTimer";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, Save, Calendar, AlertTriangle, Clock, Timer } from "lucide-react";
import { Progress } from "@/components/ui/progress";
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

export function TaskDetailsModal({ task, open, onOpenChange }: { task: Task, open: boolean, onOpenChange: (o: boolean) => void }) {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<"details" | "timer">("details");

    const formatDateForInput = (dateString?: string) => {
        if (!dateString) return "";
        return new Date(dateString).toISOString().split('T')[0];
    };

    const [form, setForm] = useState({
        title: "", description: "", priority: "MEDIUM" as Priority, subject: "",
        type: "READING", status: "TODO" as Status, estimated_hours: "", target_date: ""
    });

    useEffect(() => {
        if (open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setForm({
                title: task.title,
                description: task.description || "",
                priority: task.priority,
                subject: task.subject || "",
                type: task.type || "READING",
                status: task.status,
                estimated_hours: task.estimated_hours ? String(task.estimated_hours) : "",
                target_date: formatDateForInput(task.target_date),
            });
        }
    }, [task, open]);

    const { data: timeLogData } = useQuery({
        queryKey: ["taskTimeLogs", task.id],
        queryFn: () => getTaskTimeLogs(task.id),
        enabled: open,
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<Task>) => updateTask({ id: task.id, data }),
        onSuccess: () => { toast.success("Task updated"); queryClient.invalidateQueries({ queryKey: ["tasks"] }); onOpenChange(false); }
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteTask(task.id),
        onSuccess: () => { toast.success("Target deleted"); queryClient.invalidateQueries({ queryKey: ["tasks"] }); onOpenChange(false); }
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Target</DialogTitle>
                </DialogHeader>

                {/* Tab Toggle */}
                <div className="flex bg-muted p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab("details")}
                        className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${activeTab === "details" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Details
                    </button>
                    <button
                        onClick={() => setActiveTab("timer")}
                        className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors flex items-center justify-center gap-1.5 ${activeTab === "timer" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        <Timer className="h-3.5 w-3.5" /> Timer & Logs
                    </button>
                </div>

                {activeTab === "details" ? (
                    <>
                        {/* Time Progress */}
                        <div className="bg-muted/30 rounded-lg p-3 border">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 text-primary" /> Time Progress
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {totalLoggedHours}h / {estimatedHours > 0 ? `${estimatedHours}h` : "—"}
                                </span>
                            </div>
                            <Progress value={progressPercent} className="h-2" />
                        </div>

                        <div className="grid gap-4 py-2">
                            <div className="space-y-2"><label className="text-sm font-medium">Title</label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><label className="text-sm font-medium">Subject</label><Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} /></div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Task Type</label>
                                    <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent><SelectItem value="READING">📖 Reading</SelectItem><SelectItem value="PRACTICE">✍️ Practice</SelectItem><SelectItem value="MOCK_TEST">🎯 Mock Test</SelectItem><SelectItem value="REVISION">🧠 Revision</SelectItem></SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Status</label>
                                    <Select value={form.status} onValueChange={(v: Status) => setForm({ ...form, status: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent><SelectItem value="TODO">To Study</SelectItem><SelectItem value="IN_PROGRESS">In Revision</SelectItem><SelectItem value="DONE">Completed</SelectItem></SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Priority</label>
                                    <Select value={form.priority} onValueChange={(v: Priority) => setForm({ ...form, priority: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent><SelectItem value="HIGH">High</SelectItem><SelectItem value="MEDIUM">Medium</SelectItem><SelectItem value="LOW">Low</SelectItem></SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2"><label className="text-sm font-medium">Est. Hours</label><Input type="number" value={form.estimated_hours} onChange={e => setForm({ ...form, estimated_hours: e.target.value })} /></div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Target Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input type="date" className="pl-9" value={form.target_date} onChange={e => setForm({ ...form, target_date: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2"><label className="text-sm font-medium">Description</label><Textarea className="min-h-[80px]" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                        </div>

                        <div className="flex justify-between border-t pt-4">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm" disabled={deleteMutation.isPending}>
                                        {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4 mr-2" /> Delete</>}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                                            <AlertTriangle className="w-5 h-5" /> Delete this target?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-base">
                                            Are you sure you want to permanently delete <strong>&quot;{task.title}&quot;</strong>? This action cannot be undone and will remove it from your syllabus tracking.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            onClick={() => deleteMutation.mutate()}
                                        >
                                            Yes, delete it
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
                                <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
                                    {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save</>}
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="space-y-6 py-2">
                        {/* Timer */}
                        <div className="bg-muted/30 rounded-xl border p-6">
                            <StudyTimer taskId={task.id} taskTitle={task.title} />
                        </div>

                        {/* Time Progress */}
                        <div className="bg-muted/30 rounded-lg p-3 border">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 text-primary" /> Total Logged
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {totalLoggedHours}h / {estimatedHours > 0 ? `${estimatedHours}h` : "—"}
                                </span>
                            </div>
                            <Progress value={progressPercent} className="h-2" />
                        </div>

                        {/* Past Time Logs */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold">Session History</h4>
                            {timeLogs.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-4 text-center">No sessions logged yet. Start the timer above!</p>
                            ) : (
                                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                                    {timeLogs.map((log: TimeLog) => (
                                        <div key={log.id} className="flex items-center justify-between bg-card border rounded-lg p-3 group">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">
                                                        {log.duration_minutes >= 60
                                                            ? `${Math.floor(log.duration_minutes / 60)}h ${log.duration_minutes % 60}m`
                                                            : `${log.duration_minutes}m`
                                                        }
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {formatDistanceToNow(new Date(log.logged_at), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                {log.note && (
                                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{log.note}</p>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                                onClick={() => deleteLogMutation.mutate(log.id)}
                                                disabled={deleteLogMutation.isPending}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}