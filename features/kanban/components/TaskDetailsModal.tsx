"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Task, Priority, Status, updateTask, deleteTask } from "../api";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, Save, Calendar, AlertTriangle } from "lucide-react";

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

    const updateMutation = useMutation({
        mutationFn: (data: Partial<Task>) => updateTask({ id: task.id, data }),
        onSuccess: () => { toast.success("Task updated"); queryClient.invalidateQueries({ queryKey: ["tasks"] }); onOpenChange(false); }
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteTask(task.id),
        onSuccess: () => { toast.success("Target deleted"); queryClient.invalidateQueries({ queryKey: ["tasks"] }); onOpenChange(false); }
    });

    const handleSave = () => {
        updateMutation.mutate({
            ...form,
            estimated_hours: form.estimated_hours ? parseInt(form.estimated_hours) : undefined,
            target_date: form.target_date ? new Date(form.target_date).toISOString() : undefined,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader><DialogTitle>Edit Target</DialogTitle></DialogHeader>

                <div className="grid gap-4 py-4">
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
            </DialogContent>
        </Dialog>
    );
}