"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTasks, Task } from "@/features/kanban/api";
import { Loader2, LayoutDashboard, ListTodo, Search, Target } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { KanbanBoardView } from "@/features/kanban/components/KanbanBoardView";
import { TaskListView } from "@/features/kanban/components/TaskListView";
import { AddTaskModal } from "@/features/kanban/components/AddTaskModal";
import { TaskDetailsPanel } from "@/features/kanban/components/TaskDetailsPanel";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { useAppTour } from "@/features/tour/useAppTour";
import { MOCK_TOUR_TASKS } from "@/features/tour/tourMockData";

type ViewMode = "BOARD" | "LIST";

export default function TrackerDashboard() {
    const [view, setView] = useState<ViewMode>("BOARD");
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("ALL");
    const [priorityFilter, setPriorityFilter] = useState("ALL");
    const { isOpen } = useAppTour();

    const { data: realTasks = [], isLoading } = useQuery({
        queryKey: ["tasks"],
        queryFn: getTasks,
    });

    const tasks = (realTasks.length === 0 && isOpen) ? MOCK_TOUR_TASKS : realTasks;

    if (isLoading && !isOpen) {
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
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">

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

            <div data-tour="tracker-main-content" className="flex flex-col lg:flex-row items-center justify-between gap-3 bg-card/60 backdrop-blur-md border border-border/40 rounded-2xl p-2.5 shadow-xs">
                {/* Search & Filters */}
                <div data-tour="tracker-filters" className="flex flex-col sm:flex-row w-full lg:w-auto flex-1 gap-2">
                    <div className="relative w-full sm:flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search targets..."
                            className="pl-9 h-9 w-full rounded-full text-xs bg-background/60 border-border/40 focus-visible:ring-1"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    {/* Subject & Priority: Share same line on mobile */}
                    <div className="flex gap-2 w-full sm:w-auto shrink-0">
                        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                            <SelectTrigger className="flex-1 sm:w-37.5 h-9 rounded-full text-xs bg-background/60 border-border/40 font-medium">
                                <SelectValue placeholder="All Subjects" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                                <SelectItem value="ALL">All Subjects</SelectItem>
                                {uniqueSubjects.map((subject) => (
                                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger className="flex-1 sm:w-32.5 h-9 rounded-full text-xs bg-background/60 border-border/40 font-medium">
                                <SelectValue placeholder="Any Priority" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                                <SelectItem value="ALL">Any Priority</SelectItem>
                                <SelectItem value="HIGH">High Priority</SelectItem>
                                <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                                <SelectItem value="LOW">Low Priority</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Actions: View Toggle & Add Task share same line on mobile */}
                <div className="flex items-center w-full lg:w-auto gap-2 shrink-0">
                    <div className="flex bg-muted/60 p-1 rounded-full border border-border/30 flex-1 sm:flex-none justify-center h-9 items-center">
                        <button
                            type="button"
                            onClick={() => setView("BOARD")}
                            className={`flex items-center justify-center gap-1.5 px-3.5 h-7 rounded-full text-xs transition-all cursor-pointer ${
                                view === "BOARD"
                                    ? "bg-background text-foreground shadow-xs font-bold"
                                    : "text-muted-foreground hover:text-foreground font-medium"
                            }`}
                        >
                            <LayoutDashboard className="w-3.5 h-3.5" />
                            <span>Board</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setView("LIST")}
                            className={`flex items-center justify-center gap-1.5 px-3.5 h-7 rounded-full text-xs transition-all cursor-pointer ${
                                view === "LIST"
                                    ? "bg-background text-foreground shadow-xs font-bold"
                                    : "text-muted-foreground hover:text-foreground font-medium"
                            }`}
                        >
                            <ListTodo className="w-3.5 h-3.5" />
                            <span>List</span>
                        </button>
                    </div>
                    <div data-tour="tracker-add-btn" className="shrink-0 flex items-center h-9">
                        <AddTaskModal />
                    </div>
                </div>
            </div>

            <div data-tour="tracker-board" className="mt-6">
                <div className="w-full min-w-0">
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
                                    selectedTaskId={selectedTask?.id}
                                    onSelectTask={setSelectedTask}
                                />
                            )}
                            {view === "LIST" && (
                                <TaskListView
                                    tasks={filteredTasks}
                                    selectedTaskId={selectedTask?.id}
                                    onSelectTask={setSelectedTask}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>

            <Dialog open={!!selectedTask} onOpenChange={(open) => { if (!open) setSelectedTask(null); }}>
                <DialogContent className="sm:max-w-125 max-h-[90vh] overflow-y-auto rounded-2xl p-5 sm:p-6">
                    <DialogTitle className="sr-only">Edit Target Details</DialogTitle>
                    {selectedTask && (
                        <TaskDetailsPanel
                            key={selectedTask.id}
                            task={selectedTask}
                            onClose={() => setSelectedTask(null)}
                            showCloseButton={false}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}