// components/QuickAddTask.tsx
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTask, Status } from "../api";

export function QuickAddTask({ columnId }: { columnId: Status }) {
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState("");
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (newTitle: string) => createTask({ title: newTitle, status: columnId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            setTitle("");
        },
    });

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && title.trim()) mutation.mutate(title);
        if (e.key === "Escape") { setIsAdding(false); setTitle(""); }
    };

    if (!isAdding) {
        return (
            <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:bg-muted/50 mt-2 h-8" onClick={() => setIsAdding(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add target...
            </Button>
        );
    }

    return (
        <div className="mt-2 bg-background border rounded-md shadow-sm p-1.5 flex items-center gap-2">
            <Input autoFocus placeholder="What to study?" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={handleKeyDown} onBlur={() => { if (!title.trim()) setIsAdding(false); }} className="h-8 border-none focus-visible:ring-0 px-2 text-sm" disabled={mutation.isPending} />
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mr-2 shrink-0" />}
        </div>
    );
}