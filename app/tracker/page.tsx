"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTasks } from "@/features/kanban/api";
import { Loader2, LayoutDashboard, ListTodo, Search, Target, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { KanbanBoardView } from "@/features/kanban/components/KanbanBoardView";
import { TaskListView } from "@/features/kanban/components/TaskListView";
import { TaskAnalyticsView } from "@/features/kanban/components/TaskAnalyticsView";
import { AddTaskModal } from "@/features/kanban/components/AddTaskModal";

type ViewMode = "BOARD" | "LIST" | "ANALYTICS";

export default function TrackerDashboard() {
    const [view, setView] = useState<ViewMode>("BOARD");

    const [searchQuery, setSearchQuery] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("ALL");
    const [priorityFilter, setPriorityFilter] = useState("ALL");

    const { data: tasks = [], isLoading } = useQuery({
        queryKey: ["tasks"],
        queryFn: getTasks,
    });

    if (isLoading) {
        return <div className="flex justify-center py-32"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
    }

    const uniqueSubjects = Array.from(new Set(tasks.map((t) => t.subject).filter(Boolean)));

    const filteredTasks = tasks.filter((task) => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSubject = subjectFilter === "ALL" || task.subject === subjectFilter;
        const matchesPriority = priorityFilter === "ALL" || task.priority === priorityFilter;
        return matchesSearch && matchesSubject && matchesPriority;
    });

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 min-h-screen">

            <div className="flex flex-col justify-between border-b pb-6">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Target className="w-8 h-8 text-primary" /> Syllabus Tracker
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Manage your study targets and track your progress.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-card border rounded-lg p-2 shadow-sm">

                <div className={`flex flex-col sm:flex-row w-full gap-2 transition-opacity ${view === "ANALYTICS" ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search targets..." className="pl-9 h-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                        <SelectTrigger className="w-full sm:w-[160px] h-9"><SelectValue placeholder="All Subjects" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Subjects</SelectItem>
                            {uniqueSubjects.map((subject) => (
                                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger className="w-full sm:w-[140px] h-9"><SelectValue placeholder="Any Priority" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Any Priority</SelectItem>
                            <SelectItem value="HIGH">High Priority</SelectItem>
                            <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                            <SelectItem value="LOW">Low Priority</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex bg-muted p-1 rounded-md shrink-0 w-full lg:w-auto justify-center">
                    <Button variant={view === "BOARD" ? "default" : "ghost"} size="sm" onClick={() => setView("BOARD")} className="h-7 text-xs">
                        <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" /> Board
                    </Button>
                    <Button variant={view === "LIST" ? "default" : "ghost"} size="sm" onClick={() => setView("LIST")} className="h-7 text-xs">
                        <ListTodo className="w-3.5 h-3.5 mr-1.5" /> List
                    </Button>
                    <Button variant={view === "ANALYTICS" ? "default" : "ghost"} size="sm" onClick={() => setView("ANALYTICS")} className="h-7 text-xs">
                        <BarChart3 className="w-3.5 h-3.5 mr-1.5" /> Insights
                    </Button>
                </div>

                <AddTaskModal />
            </div>

            <div className="mt-2">
                {view === "ANALYTICS" ? (
                    <TaskAnalyticsView tasks={tasks} />
                ) : filteredTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <Target className="w-12 h-12 mb-4 opacity-20" />
                        <p>No study targets found matching your filters.</p>
                    </div>
                ) : (
                    <>
                        {view === "BOARD" && <KanbanBoardView tasks={filteredTasks} />}
                        {view === "LIST" && <TaskListView tasks={filteredTasks} />}
                    </>
                )}
            </div>

        </div>
    );
}