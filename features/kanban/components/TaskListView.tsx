"use client";

import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Task, startSession, pauseSession, resumeSession, getActiveSession } from "../api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    ColumnDef,
    flexRender,
    SortingState
} from "@tanstack/react-table";
import { ChevronsUpDown, ChevronUp, ChevronDown, Play, Pause, Loader2 } from "lucide-react";
import { dispatchSessionUpdate, ActiveSession } from "../timerUtils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function TaskListView({ 
    tasks, 
    onSelectTask, 
    selectedTaskId 
}: { 
    tasks: Task[]; 
    onSelectTask: (t: Task) => void; 
    selectedTaskId?: string; 
}) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [session, setSession] = useState<ActiveSession | null>(null);
    const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);

    const mapSessionData = (data: any): ActiveSession | null => {
        if (!data) return null;
        return {
            sessionId: data.id,
            taskId: data.task_id,
            taskTitle: data.task_title,
            startedAt: data.started_at ? new Date(data.started_at).getTime() : null,
            accumulatedSeconds: data.accumulated_seconds,
            isPaused: data.is_paused,
        };
    };

    useEffect(() => {
        const checkActive = async () => {
            try {
                const activeData = await getActiveSession();
                setSession(mapSessionData(activeData));
            } catch (err) {
                console.error("Failed to load active study session", err);
            }
        };
        checkActive();

        const handleUpdate = (e: Event) => {
            const customEvent = e as CustomEvent<ActiveSession | null>;
            setSession(customEvent.detail);
        };
        window.addEventListener("session-update", handleUpdate);
        return () => window.removeEventListener("session-update", handleUpdate);
    }, []);

    const handleTimerClick = async (e: React.MouseEvent, targetTask: Task) => {
        e.stopPropagation();
        if (pendingTaskId !== null) return;

        setPendingTaskId(targetTask.id);
        const isCurrentSession = session !== null && session.taskId === targetTask.id;
        const isRunning = isCurrentSession && !session.isPaused;
        const hasSession = session !== null;

        try {
            if (isCurrentSession) {
                if (isRunning) {
                    const data = await pauseSession();
                    const active = mapSessionData(data);
                    setSession(active);
                    dispatchSessionUpdate(active);
                    toast.info("Timer paused");
                } else {
                    const data = await resumeSession();
                    const active = mapSessionData(data);
                    setSession(active);
                    dispatchSessionUpdate(active);
                    toast.info("Timer resumed");
                }
            } else {
                if (hasSession) {
                    toast.error(`A timer is already running for "${session.taskTitle}". Pause or log it first.`);
                    setPendingTaskId(null);
                    return;
                }
                const data = await startSession(targetTask.id);
                const active = mapSessionData(data);
                setSession(active);
                dispatchSessionUpdate(active);
                toast.success("Timer started!");
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.error || "Failed to update timer");
        } finally {
            setPendingTaskId(null);
        }
    };

    const columns = useMemo<ColumnDef<Task>[]>(() => [
        {
            id: "timer",
            header: "",
            enableSorting: false,
            cell: ({ row }) => {
                const targetTask = row.original;
                const isCurrentSession = session !== null && session.taskId === targetTask.id;
                const isRunning = isCurrentSession && !session.isPaused;
                const isPending = pendingTaskId === targetTask.id;

                const tooltipLabel = isCurrentSession 
                    ? isRunning 
                        ? "Pause Session" 
                        : "Resume Session" 
                    : "Start Session";

                return (
                    <TooltipProvider delayDuration={200}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={(e) => handleTimerClick(e, targetTask)}
                                    disabled={pendingTaskId !== null}
                                    className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                                        isCurrentSession
                                            ? isRunning
                                                ? "bg-green-500/10 border-green-500/30 text-green-500 hover:bg-green-500/20 animate-pulse"
                                                : "bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20"
                                            : "bg-muted border-border text-muted-foreground hover:bg-muted-foreground hover:text-background"
                                    }`}
                                >
                                    {isPending ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : isCurrentSession && isRunning ? (
                                        <Pause className="w-3.5 h-3.5 fill-current" />
                                    ) : (
                                        <Play className="w-3.5 h-3.5 fill-current" />
                                    )}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="center">
                                {tooltipLabel}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            }
        },
        {
            accessorKey: "subject",
            header: "Subject",
            cell: ({ row }) => (
                <span className="font-medium text-xs text-muted-foreground">
                    {row.original.subject || "-"}
                </span>
            )
        },
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => (
                <span className="font-medium">
                    {row.original.title}
                </span>
            )
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant="outline" className="text-[10px]">
                    {row.original.status.replace("_", " ")}
                </Badge>
            )
        },
        {
            accessorKey: "priority",
            header: "Priority",
            cell: ({ row }) => (
                <span className={`text-xs ${row.original.priority === "HIGH" ? "text-red-500 font-bold" : "text-muted-foreground"}`}>
                    {row.original.priority}
                </span>
            )
        }
    ], [session, pendingTaskId]);

    const table = useReactTable({
        data: tasks,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel()
    });

    if (tasks.length === 0) return <div className="text-center py-10 border rounded-lg bg-muted/10">No tasks found.</div>;

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map(headerGroup => (
                        <TableRow key={headerGroup.id} className="bg-muted/50">
                            {headerGroup.headers.map((header) => {
                                const isSorted = header.column.getIsSorted();
                                return (
                                    <TableHead
                                        key={header.id}
                                        onClick={header.column.getToggleSortingHandler()}
                                        className="select-none cursor-pointer hover:bg-muted/80 transition-colors"
                                    >
                                        <div className="flex items-center gap-1">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getCanSort() && (
                                                <span>
                                                    {isSorted === "asc" ? (
                                                        <ChevronUp className="h-3.5 w-3.5 text-primary" />
                                                    ) : isSorted === "desc" ? (
                                                        <ChevronDown className="h-3.5 w-3.5 text-primary" />
                                                    ) : (
                                                        <ChevronsUpDown className="h-3.5 w-3.5 opacity-40 hover:opacity-100" />
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows.map(row => {
                        const isSelected = row.original.id === selectedTaskId;
                        const isCurrentSession = session !== null && session.taskId === row.original.id;
                        const isRunning = isCurrentSession && !session.isPaused;

                        return (
                            <TableRow 
                                key={row.id} 
                                className={`hover:bg-muted/30 cursor-pointer transition-colors ${
                                    isSelected 
                                        ? "bg-primary/5 dark:bg-primary/10 border-l-2 border-l-primary" 
                                        : isCurrentSession
                                            ? isRunning
                                                ? "bg-green-500/[0.02] dark:bg-green-950/10 border-l-2 border-l-green-500"
                                                : "bg-amber-500/[0.02] dark:bg-amber-950/10 border-l-2 border-l-amber-500"
                                            : ""
                                }`}
                                onClick={() => onSelectTask(row.original)}
                            >
                                {row.getVisibleCells().map(cell => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}