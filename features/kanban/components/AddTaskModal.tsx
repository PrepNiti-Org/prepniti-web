"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Loader2, Calendar } from "lucide-react";
import { createTask, Task, Priority, Status } from "../api";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AddTaskModal() {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);

    const [form, setForm] = useState({
        title: "",
        subject: "",
        status: "TODO" as Status,
        priority: "MEDIUM" as Priority,
        type: "READING",
        estimated_hours: "",
        target_date: "",
        description: "",
    });

    const mutation = useMutation({
        mutationFn: (data: Partial<Task>) => createTask(data),
        onSuccess: () => {
            toast.success("Task created!");
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            setOpen(false);
            setForm({ title: "", subject: "", status: "TODO", priority: "MEDIUM", type: "READING", estimated_hours: "", target_date: "", description: "" });
        },
        onError: () => toast.error("Failed to create task"),
    });

    const handleSubmit = () => {
        if (!form.title) return toast.error("Title is required");

        mutation.mutate({
            ...form,
            estimated_hours: form.estimated_hours ? parseInt(form.estimated_hours) : undefined,
            target_date: form.target_date ? new Date(form.target_date).toISOString() : undefined,
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm"><Plus className="w-4 h-4 mr-2" /> New Task</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader><DialogTitle>Create New Target</DialogTitle></DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Title *</label>
                        <Input placeholder="What do you need to accomplish?" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Subject</label>
                            <Input placeholder="e.g. History" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Task Type</label>
                            <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="READING">📖 Reading</SelectItem>
                                    <SelectItem value="PRACTICE">✍️ Practice</SelectItem>
                                    <SelectItem value="MOCK_TEST">🎯 Mock Test</SelectItem>
                                    <SelectItem value="REVISION">🧠 Revision</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select value={form.status} onValueChange={(v: Status) => setForm({ ...form, status: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TODO">To Study</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Revision</SelectItem>
                                    <SelectItem value="DONE">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Priority</label>
                            <Select value={form.priority} onValueChange={(v: Priority) => setForm({ ...form, priority: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="HIGH">High</SelectItem>
                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                    <SelectItem value="LOW">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Est. Hours</label>
                            <Input type="number" min="0" placeholder="e.g. 2" value={form.estimated_hours} onChange={e => setForm({ ...form, estimated_hours: e.target.value })} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Target Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input type="date" className="pl-9" value={form.target_date} onChange={e => setForm({ ...form, target_date: e.target.value })} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description & Notes</label>
                        <Textarea className="min-h-[80px]" placeholder="Add links, page numbers, or study notes..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t pt-4">
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={mutation.isPending}>
                        {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Create Target
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}