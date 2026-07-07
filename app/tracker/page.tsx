"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTasks, Task } from "@/features/kanban/api";
import { Loader2, LayoutDashboard, ListTodo, Search, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { KanbanBoardView } from "@/features/kanban/components/KanbanBoardView";
import { TaskListView } from "@/features/kanban/components/TaskListView";
import { AddTaskModal } from "@/features/kanban/components/AddTaskModal";
import { TaskDetailsPanel } from "@/features/kanban/components/TaskDetailsPanel";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

type ViewMode = "BOARD" | "LIST";

function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const media = window.matchMedia(query);
        setMatches(media.matches);

        const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
        media.addEventListener("change", listener);
        return () => media.removeEventListener("change", listener);
    }, [query]);

    return mounted ? matches : false;
}

export default function TrackerDashboard() {
    const [view, setView] = useState<ViewMode>("BOARD");
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("ALL");
    const [priorityFilter, setPriorityFilter] = useState("ALL");

    const { data: tasks = [], isLoading } = useQuery({
        queryKey: ["tasks"],
        queryFn: getTasks,
    });

    const activeTask = selectedTask ? tasks.find(t => t.id === selectedTask.id) || selectedTask : null;
    const isLargeScreen = useMediaQuery("(min-width: 1024px)");

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
        <div className="container max-w-7xl mx-auto space-y-6">

            {/* <div className="relative overflow-hidden border border-primary/15 rounded-2xl p-6 bg-gradient-to-r from-primary/[0.08] via-primary/[0.03] to-transparent shadow-sm">
                <div className="absolute inset-0 bg-dot-pattern opacity-25 pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2.5 text-foreground">
                        <Target className="w-8 h-8 text-primary animate-pulse" /> Study Tracker
                    </h1>
                    <p className="text-muted-foreground text-sm mt-2 max-w-xl">
                        Manage your study targets, configure subject priorities, and monitor your preparation journey in real-time.
                    </p>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            </div> */}

            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-card border rounded-lg p-2 shadow-sm">

                <div className="flex flex-col sm:flex-row w-full gap-2 opacity-100">
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
                </div>

                <AddTaskModal />
            </div>

            <div className="flex flex-col lg:flex-row gap-6 mt-6 items-start">
                <div className="flex-1 w-full min-w-0">
                    {filteredTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border rounded-lg bg-muted/10">
                            <Target className="w-12 h-12 mb-4 opacity-20" />
                            <p>No study targets found matching your filters.</p>
                        </div>
                    ) : (
                        <>
                            {view === "BOARD" && (
                                <KanbanBoardView
                                    tasks={filteredTasks}
                                    selectedTaskId={activeTask?.id}
                                    onSelectTask={setSelectedTask}
                                />
                            )}
                            {view === "LIST" && (
                                <TaskListView
                                    tasks={filteredTasks}
                                    selectedTaskId={activeTask?.id}
                                    onSelectTask={setSelectedTask}
                                />
                            )}
                        </>
                    )}
                </div>

                {activeTask && isLargeScreen && (
                    <div className="w-full lg:w-[420px] shrink-0 sticky top-4 max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col">
                        <TaskDetailsPanel
                            task={activeTask}
                            onClose={() => setSelectedTask(null)}
                        />
                    </div>
                )}
            </div>

            <Sheet open={!!activeTask && !isLargeScreen} onOpenChange={(open) => { if (!open) setSelectedTask(null); }}>
                <SheetContent className="w-full sm:max-w-[540px] overflow-y-auto border-l shadow-2xl flex flex-col p-4 sm:p-6 h-full">
                    <SheetTitle className="sr-only">Edit Target Details</SheetTitle>
                    {activeTask && (
                        <TaskDetailsPanel
                            task={activeTask}
                            onClose={() => setSelectedTask(null)}
                            showCloseButton={false}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}