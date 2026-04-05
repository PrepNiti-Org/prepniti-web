"use client";

import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCorners } from "@dnd-kit/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Task, Status, updateTask } from "../api";
import { BoardColumn } from "./BoardColumn";

export function KanbanBoardView({ tasks }: { tasks: Task[] }) {
    const queryClient = useQueryClient();

    const moveTaskMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: Status }) => updateTask({ id, data: { status } }),
        onError: () => {
            toast.error("Failed to move task. Reverting...");
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const taskId = String(active.id);
        const newStatus = over.id as Status;

        const currentTask = tasks.find((t) => String(t.id) === taskId);
        if (!currentTask || currentTask.status === newStatus) return;

        queryClient.setQueryData(["tasks"], (oldTasks: Task[] | undefined) => {
            if (!oldTasks) return [];
            return oldTasks.map((t) => String(t.id) === taskId ? { ...t, status: newStatus } : t);
        });

        moveTaskMutation.mutate({ id: taskId, status: newStatus });
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <BoardColumn id="TODO" title="To Study 📚" tasks={tasks.filter((t) => t.status === "TODO")} />
                <BoardColumn id="IN_PROGRESS" title="In Revision 🧠" tasks={tasks.filter((t) => t.status === "IN_PROGRESS")} />
                <BoardColumn id="DONE" title="Completed ✅" tasks={tasks.filter((t) => t.status === "DONE")} />
            </div>
        </DndContext>
    );
}