"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getTasks, createTimeLog, Task } from "@/features/kanban/api";

interface ManualTimeLogCardProps {
    onSuccess?: () => void;
    hideHeader?: boolean;
}

export function ManualTimeLogCard({ onSuccess, hideHeader = false }: ManualTimeLogCardProps = {}) {
    const queryClient = useQueryClient();
    const [taskId, setTaskId] = useState("");
    const [durationHours, setDurationHours] = useState("");
    const [durationMinutes, setDurationMinutes] = useState("45");
    const [logDate, setLogDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [note, setNote] = useState("");

    const { data: tasks = [] } = useQuery<Task[]>({
        queryKey: ["tasks"],
        queryFn: getTasks,
    });

    const mutation = useMutation({
        mutationFn: async () => {
            if (!taskId) throw new Error("Please select a target task");
            const h = parseInt(durationHours || "0", 10);
            const m = parseInt(durationMinutes || "0", 10);
            const total = h * 60 + m;
            if (total <= 0) throw new Error("Please enter a valid study duration");

            return await createTimeLog(taskId, {
                duration_minutes: total,
                note: note.trim() || undefined,
                logged_at: logDate ? new Date(logDate).toISOString() : undefined,
            });
        },
        onSuccess: () => {
            toast.success("Offline study time logged!");
            setDurationHours("");
            setDurationMinutes("45");
            setNote("");
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["userTimeLogs"] });
            queryClient.invalidateQueries({ queryKey: ["profile-stats"] });
            queryClient.invalidateQueries({ queryKey: ["profile-activity"] });
            onSuccess?.();
        },
        onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { error?: string } }; message?: string })?.response?.data?.error || (err as Error)?.message || "Failed to log time";
            toast.error(msg);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate();
    };

    return (
        <div className={`rounded-3xl ${hideHeader ? "" : "border bg-card/60 backdrop-blur-md p-6"} space-y-4 shadow-sm`}>
            {!hideHeader && (
                <div className="flex items-center gap-2 pb-1 border-b border-border/40">
                    <Clock className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">Log Offline Study Hours</h3>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                        Target Task
                    </label>
                    <Select value={taskId} onValueChange={setTaskId}>
                        <SelectTrigger className="h-9 text-xs rounded-xl bg-background border-border/70">
                            <SelectValue placeholder="Select target task..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl max-h-56">
                            {tasks.map((task) => (
                                <SelectItem key={task.id} value={task.id} className="text-xs">
                                    {task.title} {task.subject ? `(${task.subject})` : ""}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">
                            Hours
                        </label>
                        <Input
                            type="number"
                            min="0"
                            max="24"
                            placeholder="0"
                            value={durationHours}
                            onChange={(e) => setDurationHours(e.target.value)}
                            className="h-9 text-xs rounded-xl"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">
                            Minutes
                        </label>
                        <Input
                            type="number"
                            min="0"
                            max="59"
                            placeholder="45"
                            value={durationMinutes}
                            onChange={(e) => setDurationMinutes(e.target.value)}
                            className="h-9 text-xs rounded-xl"
                            required
                        />
                    </div>
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                        <label className="text-xs font-semibold text-muted-foreground">
                            Date
                        </label>
                        <Input
                            type="date"
                            value={logDate}
                            onChange={(e) => setLogDate(e.target.value)}
                            className="h-9 text-xs rounded-xl"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                        Notes / Topics (Optional)
                    </label>
                    <Textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="e.g. Chapter 4 Practice Questions, Notes Revision"
                        className="resize-none text-xs rounded-xl min-h-14"
                        rows={2}
                    />
                </div>

                <div className="flex justify-end pt-1">
                    <Button
                        type="submit"
                        disabled={mutation.isPending || !taskId}
                        className="h-9 px-5 text-xs font-bold rounded-xl bg-primary hover:bg-primary/90 text-white cursor-pointer shadow-xs"
                    >
                        {mutation.isPending ? "Logging..." : "Save Offline Time"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
