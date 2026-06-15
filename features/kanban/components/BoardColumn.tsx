"use client";

import { useDroppable } from "@dnd-kit/core";
import { TaskCard } from "./TaskCard";
import { QuickAddTask } from "./QuickAddTask";
import { Task, Status } from "../api";

export function BoardColumn({
    id,
    title,
    tasks,
    selectedTaskId,
    onSelectTask
}: {
    id: Status;
    title: string;
    tasks: Task[];
    selectedTaskId?: string;
    onSelectTask: (t: Task) => void;
}) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div className="flex flex-col bg-muted/30 border rounded-xl p-3 w-full min-h-[400px]">
            <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-semibold text-sm">{title}</h3>
                <span className="bg-background px-2 py-0.5 rounded-full text-xs font-bold text-muted-foreground shadow-sm">
                    {tasks.length}
                </span>
            </div>

            <div ref={setNodeRef} className={`flex-1 transition-colors rounded-lg p-1 ${isOver ? "bg-primary/10 border-2 border-dashed border-primary/40" : "border-2 border-transparent"}`}>
                {tasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        isCurrentlySelected={task.id === selectedTaskId}
                        onSelectTask={onSelectTask}
                    />
                ))}
                {tasks.length === 0 && !isOver && <div className="h-20 flex items-center justify-center text-muted-foreground/50 text-xs italic">Empty</div>}
            </div>

            <div className="px-1 mt-1"><QuickAddTask columnId={id} /></div>
        </div>
    );
}