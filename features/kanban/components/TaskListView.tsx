"use client";

import React, { useState, useMemo } from "react";
import { Task } from "../api";
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
import { ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";

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

    const columns = useMemo<ColumnDef<Task>[]>(() => [
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
    ], []);

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
                        return (
                            <TableRow 
                                key={row.id} 
                                className={`hover:bg-muted/30 cursor-pointer transition-colors ${
                                    isSelected 
                                        ? "bg-primary/5 dark:bg-primary/10 border-l-2 border-l-primary" 
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