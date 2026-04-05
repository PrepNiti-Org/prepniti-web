"use client";

import { Task } from "../api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function TaskListView({ tasks }: { tasks: Task[] }) {
    if (tasks.length === 0) return <div className="text-center py-10 border rounded-lg bg-muted/10">No tasks found.</div>;

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead>Subject</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tasks.map((task) => (
                        <TableRow key={task.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium text-xs text-muted-foreground">{task.subject || "-"}</TableCell>
                            <TableCell className="font-medium">{task.title}</TableCell>
                            <TableCell><Badge variant="outline" className="text-[10px]">{task.status.replace("_", " ")}</Badge></TableCell>
                            <TableCell>
                                <span className={`text-xs ${task.priority === "HIGH" ? "text-red-500 font-bold" : "text-muted-foreground"}`}>{task.priority}</span>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}