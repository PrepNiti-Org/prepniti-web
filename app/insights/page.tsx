"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { getTasks, getUserTimeLogs, deleteTimeLog, TimeLog, DailyEntry } from "@/features/kanban/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Flame,
    TrendingUp,
    Clock,
    CheckCircle2,
    Calendar,
    Loader2,
    BookOpen,
    Trash2,
    History,
    PieChart as PieIcon,
    BarChart3,
    Sparkles,
    CalendarRange,
    ArrowUpRight,
    Search,
    BookOpenCheck,
    Lightbulb,
    Target,
    Activity,
    Layers
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend as RechartsLegend
} from "recharts";
import { formatDistanceToNow, format, subDays } from "date-fns";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type RangeDays = 7 | 30 | 90;

// Framer motion variants for gorgeous cascade loading
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
        opacity: 1, 
        y: 0,
        transition: {
            type: "spring" as any,
            stiffness: 90,
            damping: 14
        }
    }
};

export default function InsightsPage() {
    const queryClient = useQueryClient();
    const [range, setRange] = useState<RangeDays>(30);
    const [activeChartTab, setActiveChartTab] = useState<"trend" | "subjects" | "types">("trend");
    
    // Dynamic theme check for premium charts coloring
    const [isDarkTheme, setIsDarkTheme] = useState(true);

    useEffect(() => {
        const checkTheme = () => {
            const isDark = document.documentElement.classList.contains("dark");
            setIsDarkTheme(isDark);
        };
        
        checkTheme();
        
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        
        return () => observer.disconnect();
    }, []);
    
    // Interactive drilldown state
    const [selectedDrillSubject, setSelectedDrillSubject] = useState<string>("ALL");
    
    // Interactive audit filter state
    const [logSearchQuery, setLogSearchQuery] = useState("");
    const [logMethodFilter, setLogMethodFilter] = useState("ALL");
    const [logSubjectFilter, setLogSubjectFilter] = useState("ALL");

    // Fetch Tasks
    const { data: tasks = [], isLoading: isTasksLoading } = useQuery({
        queryKey: ["tasks"],
        queryFn: getTasks,
    });

    // Date range calculations
    const dateRange = useMemo(() => {
        const to = new Date();
        const from = subDays(to, range);
        return {
            from: from.toISOString().split("T")[0],
            to: to.toISOString().split("T")[0],
        };
    }, [range]);

    // Fetch Time Logs
    const { data: timeLogData, isLoading: isLogsLoading } = useQuery({
        queryKey: ["userTimeLogs", dateRange.from, dateRange.to],
        queryFn: () => getUserTimeLogs(dateRange.from, dateRange.to),
    });

    // Delete Log Mutation
    const deleteLogMutation = useMutation({
        mutationFn: (logId: string) => deleteTimeLog(logId),
        onSuccess: () => {
            toast.success("Study session removed");
            queryClient.invalidateQueries({ queryKey: ["userTimeLogs"] });
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
        onError: () => {
            toast.error("Failed to delete study log");
        }
    });

    const logs: TimeLog[] = timeLogData?.data || [];
    const dailyData: DailyEntry[] = timeLogData?.daily || [];
    const totalMinutes = timeLogData?.total_minutes || 0;
    const totalHours = (totalMinutes / 60).toFixed(1);

    // Calculate Streak
    const streak = (() => {
        const dateSet = new Set(dailyData.map(d => d.date));
        let currentStreak = 0;
        const today = new Date();

        for (let i = 0; i < 365; i++) {
            const d = subDays(today, i);
            const dateStr = d.toISOString().split("T")[0];
            if (dateSet.has(dateStr)) {
                currentStreak++;
            } else {
                if (i === 0) continue; // Allow skipping today if not yet studied
                break;
            }
        }
        return currentStreak;
    })();

    // Stats calculations
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "DONE").length;
    const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const totalEstHours = tasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);
    const timeEfficiency = totalEstHours === 0 ? 0 : Math.min(100, Math.round((parseFloat(totalHours) / totalEstHours) * 100));

    // Coverage Rate
    const uniqueSubjects = Array.from(new Set(tasks.map(t => t.subject).filter(Boolean)));
    const subjectsStarted = new Set(tasks.filter(t => t.status !== "TODO").map(t => t.subject)).size;
    const syllabusCoverage = uniqueSubjects.length === 0 ? 0 : Math.round((subjectsStarted / uniqueSubjects.length) * 100);

    // Trend Area Chart Data
    const trendChartData = (() => {
        const dataMap: Record<string, number> = {};
        dailyData.forEach(d => {
            dataMap[d.date] = d.minutes;
        });

        const chartList = [];
        for (let i = range - 1; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const dateStr = date.toISOString().split("T")[0];
            chartList.push({
                dateFormatted: format(date, "MMM dd"),
                "Study Minutes": dataMap[dateStr] || 0,
            });
        }
        return chartList;
    })();

    // Subject balance data (Donut Chart)
    const subjectBalanceData = (() => {
        const subMinutesMap: Record<string, number> = {};
        logs.forEach(log => {
            const task = tasks.find(t => t.id === log.task_id);
            const subject = task?.subject || "Unassigned";
            subMinutesMap[subject] = (subMinutesMap[subject] || 0) + log.duration_minutes;
        });

        const COLORS = ["#F91149", "#A6FA0F", "#00DFE8", "#8B5CF6", "#F59E0B", "#10B981", "#3B82F6"];
        return Object.entries(subMinutesMap).map(([subject, mins], index) => ({
            name: subject,
            value: parseFloat((mins / 60).toFixed(1)),
            color: COLORS[index % COLORS.length]
        })).sort((a, b) => b.value - a.value);
    })();

    // Study Type Breakdown Data (Bar Chart)
    const typeBreakdownData = (() => {
        const typeMinutesMap: Record<string, number> = {
            "READING": 0,
            "PRACTICE": 0,
            "MOCK_TEST": 0,
            "REVISION": 0
        };

        logs.forEach(log => {
            const task = tasks.find(t => t.id === log.task_id);
            const type = task?.type || "READING";
            typeMinutesMap[type] = (typeMinutesMap[type] || 0) + log.duration_minutes;
        });

        const typeLabels: Record<string, string> = {
            "READING": "Reading 📖",
            "PRACTICE": "Practice ✍️",
            "MOCK_TEST": "Mock Tests 🎯",
            "REVISION": "Revision 🧠"
        };

        return Object.entries(typeMinutesMap).map(([type, mins]) => ({
            type: typeLabels[type] || type,
            Hours: parseFloat((mins / 60).toFixed(1))
        }));
    })();

    // Subject Drilldown calculations
    const subjectDrilldownStats = useMemo(() => {
        if (selectedDrillSubject === "ALL") return null;

        const subjectTasks = tasks.filter(t => t.subject === selectedDrillSubject);
        const subTasksTotal = subjectTasks.length;
        const subTasksDone = subjectTasks.filter(t => t.status === "DONE").length;
        const subCompletion = subTasksTotal === 0 ? 0 : Math.round((subTasksDone / subTasksTotal) * 100);

        let subMinutes = 0;
        let readingMins = 0;
        let practiceMins = 0;
        let testMins = 0;
        let revisionMins = 0;

        logs.forEach(log => {
            const t = tasks.find(tsk => tsk.id === log.task_id);
            if (t?.subject === selectedDrillSubject) {
                subMinutes += log.duration_minutes;
                if (t.type === "READING") readingMins += log.duration_minutes;
                else if (t.type === "PRACTICE") practiceMins += log.duration_minutes;
                else if (t.type === "MOCK_TEST") testMins += log.duration_minutes;
                else if (t.type === "REVISION") revisionMins += log.duration_minutes;
            }
        });

        return {
            subject: selectedDrillSubject,
            totalHours: (subMinutes / 60).toFixed(1),
            completionRate: subCompletion,
            tasksTotal: subTasksTotal,
            tasksDone: subTasksDone,
            breakdown: [
                { name: "Reading", value: Math.round(readingMins / 60) },
                { name: "Practice", value: Math.round(practiceMins / 60) },
                { name: "Mock Tests", value: Math.round(testMins / 60) },
                { name: "Revision", value: Math.round(revisionMins / 60) }
            ]
        };
    }, [selectedDrillSubject, tasks, logs]);

    // AI PrepCoach advice generation
    const coachRecommendations = useMemo(() => {
        const advices = [];
        
        // Recommendation 1: Revision ratio check
        let totalRevisionMinutes = 0;
        logs.forEach(log => {
            const task = tasks.find(t => t.id === log.task_id);
            if (task?.type === "REVISION") totalRevisionMinutes += log.duration_minutes;
        });
        const revisionRatio = totalMinutes === 0 ? 0 : Math.round((totalRevisionMinutes / totalMinutes) * 100);
        
        if (revisionRatio < 15) {
            advices.push({
                type: "warning",
                title: "Boost Revision Focus 🧠",
                text: `Only ${revisionRatio}% of your study time is dedicated to revision. To build robust retention, target a minimum of 20% revision balance.`,
                action: "Convert pending board targets to Revision type"
            });
        } else {
            advices.push({
                type: "success",
                title: "Excellent Retention Habit! ✨",
                text: `Awesome job! ${revisionRatio}% of your time is spent in revision. You are cementing concepts effectively.`,
                action: "Continue spacing your revision cycles"
            });
        }

        // Recommendation 2: Subject balance check
        if (subjectBalanceData.length > 1) {
            const topSub = subjectBalanceData[0];
            const lowestSub = subjectBalanceData[subjectBalanceData.length - 1];
            const ratio = topSub.value / (lowestSub.value || 1);

            if (ratio > 3) {
                advices.push({
                    type: "info",
                    title: "Balance Your Subjects ⚖️",
                    text: `You have spent ${topSub.value}h studying ${topSub.name} but only ${lowestSub.value}h on ${lowestSub.name}. Try balancing your preparation schedules.`,
                    action: `Plan a session for ${lowestSub.name} today`
                });
            }
        }

        // Recommendation 3: Consistency & Streak advise
        if (streak >= 3) {
            advices.push({
                type: "success",
                title: "Consistency Master 🔥",
                text: `You are on a ${streak}-day hot streak! The daily neural pathways you are firing make difficult concepts stick much faster.`,
                action: "Log a session today to protect your streak"
            });
        } else {
            advices.push({
                type: "info",
                title: "Start a Daily Streak 🎯",
                text: "Studying just 20-30 minutes every day is 4x more effective than a massive 4-hour weekend cram session.",
                action: "Start a study stopwatch from the board"
            });
        }

        return advices.slice(0, 3);
    }, [logs, tasks, totalMinutes, subjectBalanceData, streak]);

    // Custom filtering for session audit log manager
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const task = tasks.find(t => t.id === log.task_id);
            const matchesSearch = log.note?.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
                task?.title.toLowerCase().includes(logSearchQuery.toLowerCase());
            
            const matchesMethod = logMethodFilter === "ALL" || task?.type === logMethodFilter;
            const matchesSubject = logSubjectFilter === "ALL" || task?.subject === logSubjectFilter;

            return matchesSearch && matchesMethod && matchesSubject;
        });
    }, [logs, tasks, logSearchQuery, logMethodFilter, logSubjectFilter]);

    // Study Rings options
    const ringSeries = [completionRate, timeEfficiency, syllabusCoverage];
    const ringOptions: unknown = {
        chart: { type: 'radialBar', background: 'transparent', fontFamily: 'inherit' },
        plotOptions: {
            radialBar: {
                hollow: { margin: 10, size: '30%', background: 'transparent' },
                track: { show: true, background: isDarkTheme ? '#1c1c1e' : '#f4f4f5', strokeWidth: '100%', margin: 8 },
                dataLabels: {
                    name: { fontSize: '18px', color: isDarkTheme ? '#ffffff' : '#09090b', fontWeight: 600 },
                    value: { fontSize: '14px', color: isDarkTheme ? '#a1a1aa' : '#71717a', formatter: (val: number) => `${val}%` },
                    total: {
                        show: true,
                        label: 'Study Index',
                        color: isDarkTheme ? '#F91149' : '#e11d48',
                        formatter: () => `${Math.round((completionRate + timeEfficiency + syllabusCoverage) / 3)}%`
                    }
                }
            }
        },
        stroke: { lineCap: 'round' },
        colors: ['#F91149', '#A6FA0F', '#00DFE8'],
        labels: ['Targets Completed', 'Time Investment', 'Syllabus Coverage'],
    };

    if (isTasksLoading || isLogsLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="animate-spin w-10 h-10 text-primary" />
                <p className="text-muted-foreground text-sm font-medium animate-pulse">Analyzing your study performance...</p>
            </div>
        );
    }

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="container max-w-7xl mx-auto space-y-8 pb-20 px-4 sm:px-6 py-6"
        >

            {/* Header section with glass effect */}
            <motion.div 
                variants={itemVariants}
                className="relative overflow-hidden rounded-2xl border bg-card/60 backdrop-blur-md p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md"
            >
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
                <div className="space-y-2 relative z-10">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                        <span className="text-xs font-semibold tracking-wider uppercase text-primary">Performance Space</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-primary bg-clip-text text-transparent">
                        PrepInsights
                    </h1>
                    <p className="text-muted-foreground text-sm sm:text-base max-w-xl">
                        Deep analytics on your study balance, targets hit, and consecutive effort metrics.
                    </p>
                </div>

                {/* Range filter switch */}
                <div className="flex bg-muted/60 p-1.5 rounded-xl border relative z-10 shrink-0 self-stretch md:self-auto justify-center sm:justify-start">
                    {([7, 30, 90] as RangeDays[]).map((d) => (
                        <button
                            key={d}
                            onClick={() => setRange(d)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${range === d
                                ? "bg-background shadow-md text-foreground border border-border/10 font-bold"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {d} Days
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Key Metrics Grid */}
            <motion.div 
                variants={itemVariants}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                {/* Metric 1 */}
                <motion.div whileHover={{ y: -5, scale: 1.015 }} className="transition-all duration-300">
                    <Card className="hover:border-primary/30 transition-all shadow-sm h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Total Study Time</CardTitle>
                            <Clock className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black tracking-tight">{totalHours}h</div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <span className="font-bold text-green-500">{logs.length} sessions</span> logged in {range} days
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Metric 2 */}
                <motion.div whileHover={{ y: -5, scale: 1.015 }} className="transition-all duration-300">
                    <Card className="hover:border-primary/30 transition-all shadow-sm h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Study Streak</CardTitle>
                            <Flame className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black tracking-tight flex items-baseline gap-1.5">
                                {streak} <span className="text-sm font-medium text-muted-foreground">days</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {streak > 0 ? "🔥 Keep the flame burning!" : "No streak active yet"}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Metric 3 */}
                <motion.div whileHover={{ y: -5, scale: 1.015 }} className="transition-all duration-300">
                    <Card className="hover:border-primary/30 transition-all shadow-sm h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Targets Hit</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black tracking-tight">{completionRate}%</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                <span className="font-semibold">{completedTasks}</span> completed of {totalTasks} total
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Metric 4 */}
                <motion.div whileHover={{ y: -5, scale: 1.015 }} className="transition-all duration-300">
                    <Card className="hover:border-primary/30 transition-all shadow-sm h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Syllabus Coverage</CardTitle>
                            <BookOpen className="h-4 w-4 text-teal-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black tracking-tight">{syllabusCoverage}%</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Active in <span className="font-semibold">{subjectsStarted}</span> of {uniqueSubjects.length} subjects
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            {/* Interactive Performance Space and Graphs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left side: Rings & mastery */}
                <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
                    <Card className="border bg-card/60 backdrop-blur-md shadow-md">
                        <CardHeader className="pb-0">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-primary" /> Core Study Rings
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">Close all three rings to maximize syllabus mastery.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center p-0 pb-6 pt-2">
                            <div className="w-full max-w-[280px]">
                                {/* @ts-expect-error - Suppress apexcharts typescript warning */}
                                <ReactApexChart options={ringOptions} series={ringSeries} type="radialBar" height={310} />
                            </div>

                            <div className="flex flex-col gap-2.5 w-full px-6 mt-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#F91149]" /><span className="text-xs text-foreground/80">Targets Completed</span></div>
                                    <span className="text-xs font-semibold text-foreground/90">{completionRate}%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#A6FA0F]" /><span className="text-xs text-foreground/80">Time Investment</span></div>
                                    <span className="text-xs font-semibold text-foreground/90">{timeEfficiency}%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#00DFE8]" /><span className="text-xs text-foreground/80">Syllabus Coverage</span></div>
                                    <span className="text-xs font-semibold text-foreground/90">{syllabusCoverage}%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Interactive PrepCoach AI Advice Panel */}
                    <Card className="border bg-gradient-to-br from-primary/5 via-transparent to-accent/5 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                                <Lightbulb className="h-4 w-4 text-amber-500" /> PrepCoach Recommendations
                            </CardTitle>
                            <CardDescription className="text-xs">Contextual study advice based on your logged metrics.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {coachRecommendations.map((adv, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ scale: 1.01, x: 2 }}
                                    className={`p-3 rounded-lg border text-xs space-y-1.5 transition-all ${
                                        adv.type === "warning"
                                            ? "border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10"
                                            : adv.type === "success"
                                            ? "border-green-500/20 bg-green-500/5 hover:bg-green-500/10"
                                            : "border-primary/20 bg-primary/5 hover:bg-primary/10"
                                    }`}
                                >
                                    <h5 className="font-bold flex items-center justify-between text-foreground">
                                        {adv.title}
                                    </h5>
                                    <p className="text-muted-foreground leading-normal">{adv.text}</p>
                                    <div className="text-[10px] font-semibold text-primary/95 flex items-center gap-1 mt-1">
                                        <span>Focus: {adv.action}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Right side: Interactive advanced charts panel */}
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6 animate-in fade-in duration-300">
                    <Card className="shadow-md">
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                            <div>
                                <CardTitle className="text-lg font-bold">Interactive Analytics</CardTitle>
                                <CardDescription>Visualize trends, subject balance, and preparation methods.</CardDescription>
                            </div>

                            {/* Chart switcher tabs */}
                            <div className="flex bg-muted p-1 rounded-lg self-start sm:self-auto border">
                                <button
                                    onClick={() => setActiveChartTab("trend")}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeChartTab === "trend" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    <CalendarRange className="h-3.5 w-3.5" /> Trend
                                </button>
                                <button
                                    onClick={() => setActiveChartTab("subjects")}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeChartTab === "subjects" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    <PieIcon className="h-3.5 w-3.5" /> Subjects
                                </button>
                                <button
                                    onClick={() => setActiveChartTab("types")}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeChartTab === "types" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    <BarChart3 className="h-3.5 w-3.5" /> Methods
                                </button>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-6 h-[340px]">
                            <AnimatePresence mode="wait">
                                {activeChartTab === "trend" && (
                                    <motion.div
                                        key="trend"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        transition={{ duration: 0.2 }}
                                        className="w-full h-full"
                                    >
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid stroke="currentColor" strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                                <XAxis dataKey="dateFormatted" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: "currentColor", opacity: 0.6 }} />
                                                <YAxis fontSize={10} tickLine={false} axisLine={false} tick={{ fill: "currentColor", opacity: 0.6 }} />
                                                <RechartsTooltip
                                                    contentStyle={{ 
                                                        backgroundColor: "hsl(var(--popover))", 
                                                        border: "1px solid hsl(var(--border))", 
                                                        borderRadius: "8px",
                                                        color: "hsl(var(--popover-foreground))"
                                                    }}
                                                    labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                                                    itemStyle={{ color: "hsl(var(--primary))" }}
                                                />
                                                <Area type="monotone" dataKey="Study Minutes" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMinutes)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </motion.div>
                                )}
 
                                {activeChartTab === "subjects" && (
                                    <motion.div
                                        key="subjects"
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        transition={{ duration: 0.2 }}
                                        className="w-full h-full"
                                    >
                                        {subjectBalanceData.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                                <PieIcon className="w-10 h-10 mb-2 opacity-30" />
                                                <p className="text-sm">No subject breakdown log data available.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-5 h-full items-center">
                                                <div className="col-span-3 h-[280px]">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={subjectBalanceData}
                                                                cx="50%"
                                                                cy="50%"
                                                                innerRadius={55}
                                                                outerRadius={85}
                                                                paddingAngle={3}
                                                                dataKey="value"
                                                            >
                                                                {subjectBalanceData.map((entry, idx) => (
                                                                    <Cell key={`cell-${idx}`} fill={entry.color} />
                                                                ))}
                                                            </Pie>
                                                            <RechartsTooltip 
                                                                formatter={(val) => `${val}h`} 
                                                                contentStyle={{ 
                                                                    backgroundColor: "hsl(var(--popover))", 
                                                                    border: "1px solid hsl(var(--border))", 
                                                                    borderRadius: "8px",
                                                                    color: "hsl(var(--popover-foreground))"
                                                                }}
                                                                labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                                                            />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                                <div className="col-span-2 space-y-2 max-h-[250px] overflow-y-auto pr-2">
                                                    <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Study Distribution</h5>
                                                    {subjectBalanceData.map((sub, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => setSelectedDrillSubject(sub.name)}
                                                            className={`flex items-center justify-between text-xs w-full p-1.5 rounded transition-all hover:bg-muted/40 text-left ${selectedDrillSubject === sub.name ? "bg-muted border border-border/60 font-semibold" : "border border-transparent"}`}
                                                        >
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sub.color }} />
                                                                <span className="truncate max-w-[120px] font-medium">{sub.name}</span>
                                                            </div>
                                                            <span className="font-semibold text-muted-foreground shrink-0">{sub.value}h</span>
                                                        </button>
                                                    ))}
                                                    {selectedDrillSubject !== "ALL" && (
                                                        <Button size="sm" variant="ghost" className="w-full text-xs h-7 text-primary/80 hover:text-primary mt-1" onClick={() => setSelectedDrillSubject("ALL")}>
                                                            Clear Selection
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
 
                                {activeChartTab === "types" && (
                                    <motion.div
                                        key="types"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="w-full h-full"
                                    >
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={typeBreakdownData} margin={{ top: 20, right: 10, left: -25, bottom: 5 }}>
                                                <CartesianGrid stroke="currentColor" strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                                <XAxis dataKey="type" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: "currentColor", opacity: 0.6 }} />
                                                <YAxis fontSize={10} tickLine={false} axisLine={false} tick={{ fill: "currentColor", opacity: 0.6 }} />
                                                <RechartsTooltip 
                                                    formatter={(val) => `${val}h`} 
                                                    contentStyle={{ 
                                                        backgroundColor: "hsl(var(--popover))", 
                                                        border: "1px solid hsl(var(--border))", 
                                                        borderRadius: "8px",
                                                        color: "hsl(var(--popover-foreground))"
                                                    }}
                                                    labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                                                />
                                                <Bar dataKey="Hours" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={45}>
                                                    {typeBreakdownData.map((entry, index) => {
                                                        const colors = ["#8B5CF6", "#F59E0B", "#10B981", "#3B82F6"];
                                                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                                    })}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>

                    {/* Drilldown view for selected subject with spring physics accordion */}
                    <AnimatePresence mode="popLayout">
                        {subjectDrilldownStats && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, scale: 0.97 }}
                                animate={{ opacity: 1, height: "auto", scale: 1 }}
                                exit={{ opacity: 0, height: 0, scale: 0.97 }}
                                transition={{ type: "spring" as any, stiffness: 110, damping: 16 }}
                                className="overflow-hidden"
                            >
                                <Card className="border bg-[#09090b]/40 backdrop-blur-sm border-zinc-800 shadow-md">
                                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                        <div>
                                            <span className="text-[10px] font-bold tracking-wider uppercase text-primary">Subject Drilldown Deep-dive</span>
                                            <CardTitle className="text-base font-bold text-zinc-100 flex items-center gap-2">
                                                <BookOpenCheck className="h-4 w-4 text-primary" /> {subjectDrilldownStats.subject}
                                            </CardTitle>
                                        </div>
                                        <Button size="sm" variant="ghost" className="h-8 text-xs text-muted-foreground hover:text-foreground" onClick={() => setSelectedDrillSubject("ALL")}>
                                            Dismiss Drilldown
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/40 text-center">
                                                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Total Invested</span>
                                                <div className="text-xl font-black mt-1 text-zinc-100">{subjectDrilldownStats.totalHours} Hours</div>
                                            </div>
                                            <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/40 text-center">
                                                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Syllabus Completion</span>
                                                <div className="text-xl font-black mt-1 text-zinc-100">{subjectDrilldownStats.completionRate}%</div>
                                            </div>
                                            <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/40 text-center">
                                                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Goal Status</span>
                                                <div className="text-xl font-black mt-1 text-zinc-100">{subjectDrilldownStats.tasksDone} / {subjectDrilldownStats.tasksTotal} Met</div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Method Breakdown for {subjectDrilldownStats.subject}</span>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                {subjectDrilldownStats.breakdown.map((item, idx) => (
                                                    <div key={idx} className="bg-zinc-900/30 p-2 rounded border border-zinc-800/20 flex justify-between items-center text-xs">
                                                        <span className="text-zinc-400">{item.name}</span>
                                                        <span className="font-bold text-zinc-200">{item.value}h</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

            </div>

            {/* Heatmap & Recent Sessions Manager in detailed Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Heatmap space */}
                <Card className="lg:col-span-1 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-green-500" /> Study Grid
                        </CardTitle>
                        <CardDescription>Study activity visual map over past 90 days.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-6 overflow-hidden">
                        {/* Custom visual study heatmap */}
                        {(() => {
                            const dailyMap: Record<string, number> = {};
                            dailyData.forEach(d => { dailyMap[d.date] = d.minutes; });

                            // Create exactly 13 weeks of Sunday-Saturday blocks (91 days total)
                            const today = new Date();
                            const dayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday
                            
                            // Align endDate to the Saturday of the current week so our columns are filled
                            const endDate = subDays(today, -(6 - dayOfWeek));
                            
                            const days = [];
                            for (let i = 90; i >= 0; i--) {
                                const d = subDays(endDate, i);
                                const dateStr = d.toISOString().split("T")[0];
                                days.push({
                                    date: dateStr,
                                    minutes: dailyMap[dateStr] || 0,
                                    dayOfWeek: d.getDay(),
                                });
                            }

                            // Slice into 13 columns (weeks), each containing exactly 7 days (Sunday - Saturday)
                            const weeks: typeof days[] = [];
                            for (let i = 0; i < 13; i++) {
                                weeks.push(days.slice(i * 7, (i + 1) * 7));
                            }

                            const getIntensity = (m: number) => {
                                if (m === 0) return "bg-muted/40 hover:bg-muted/60";
                                if (m < 30) return "bg-green-300/30 dark:bg-green-950/45 border border-green-500/10 hover:border-green-500/30";
                                if (m < 60) return "bg-green-400/60 dark:bg-green-800/40 border border-green-500/20 hover:border-green-500/50";
                                return "bg-green-500/90 dark:bg-green-600/70 border border-green-400/40 hover:border-green-400/70 shadow-sm shadow-green-500/10";
                            };

                            return (
                                <div className="flex flex-col gap-2 w-full max-w-[280px] sm:max-w-none items-center">
                                    
                                    {/* Months Row */}
                                    <div className="flex text-[9px] text-muted-foreground select-none font-semibold h-4 w-full items-center pl-6">
                                        <div className="w-8 shrink-0" /> {/* Align spacer with Mon/Wed/Fri labels */}
                                        <div className="flex gap-1.5 flex-1 justify-between">
                                            {weeks.map((week, wi) => {
                                                const date = new Date(week[0].date);
                                                const prevWeekDate = wi > 0 ? new Date(weeks[wi - 1][0].date) : null;
                                                const isNewMonth = !prevWeekDate || date.getMonth() !== prevWeekDate.getMonth();
                                                
                                                return (
                                                    <div key={wi} className="w-2.5 shrink-0 relative">
                                                        {isNewMonth && (
                                                            <span className="absolute left-0 -top-1.5 text-[9px] whitespace-nowrap text-muted-foreground/80 font-bold">
                                                                {format(date, "MMM")}
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Grid row with weekday labels on left */}
                                    <div className="flex items-center gap-2 w-full justify-center">
                                        
                                        {/* Weekday Labels Column */}
                                        <div className="flex flex-col justify-between text-[9px] text-muted-foreground h-[94px] w-6 shrink-0 text-right select-none font-bold py-1">
                                            <span>Sun</span>
                                            <span>Mon</span>
                                            <span>Tue</span>
                                            <span>Wed</span>
                                            <span>Thu</span>
                                            <span>Fri</span>
                                            <span>Sat</span>
                                        </div>

                                        {/* Columns of weeks */}
                                        <div className="flex gap-1.5 flex-1 justify-between">
                                            {weeks.map((week, wi) => (
                                                <div key={wi} className="flex flex-col gap-1.5 shrink-0">
                                                    {week.map(day => (
                                                        <div
                                                            key={day.date}
                                                            className={`h-2.5 w-2.5 rounded-[2px] ${getIntensity(day.minutes)} transition-all hover:scale-125 cursor-pointer duration-150 hover:ring-1 hover:ring-primary/60`}
                                                            title={`${day.minutes}m studied on ${format(new Date(day.date), "MMM dd, yyyy")}`}
                                                        />
                                                    ))}
                                                </div>
                                            ))}
                                        </div>

                                    </div>

                                    {/* Footer Legend row */}
                                    <div className="flex justify-between items-center text-[10px] text-muted-foreground w-full px-1 mt-2 max-w-[280px]">
                                        <span>Less</span>
                                        <div className="flex items-center gap-1">
                                            <div className="h-2.5 w-2.5 rounded-[2px] bg-muted/40" />
                                            <div className="h-2.5 w-2.5 rounded-[2px] bg-green-300/30 dark:bg-green-950/45 border" />
                                            <div className="h-2.5 w-2.5 rounded-[2px] bg-green-400/60 dark:bg-green-800/40 border" />
                                            <div className="h-2.5 w-2.5 rounded-[2px] bg-green-500/90 dark:bg-green-600/70 border" />
                                        </div>
                                        <span>More</span>
                                    </div>

                                </div>
                            );
                        })()}
                    </CardContent>
                </Card>

                {/* Session Logs Manager with list item animations */}
                <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <History className="h-4 w-4 text-purple-500" /> Session Auditor
                                </CardTitle>
                                <CardDescription>Search, filter, and audit logged study efforts.</CardDescription>
                            </div>

                            {/* Search box inside logs manager */}
                            <div className="relative w-full sm:w-60">
                                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="Search notes or tasks..."
                                    className="pl-8 h-8 text-xs bg-muted/30"
                                    value={logSearchQuery}
                                    onChange={(e) => setLogSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Interactive multi-select filter row */}
                        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase mr-1">Filter Logs:</span>
                            
                            {/* Method select */}
                            <select
                                className="bg-muted text-[11px] font-semibold py-1 px-2 rounded-md border border-border/50 text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                                value={logMethodFilter}
                                onChange={(e) => setLogMethodFilter(e.target.value)}
                            >
                                <option value="ALL">All Methods 🧠</option>
                                <option value="READING">Reading 📖</option>
                                <option value="PRACTICE">Practice ✍️</option>
                                <option value="MOCK_TEST">Mock Tests 🎯</option>
                                <option value="REVISION">Revision 🧠</option>
                            </select>

                            {/* Subject select */}
                            <select
                                className="bg-muted text-[11px] font-semibold py-1 px-2 rounded-md border border-border/50 text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                                value={logSubjectFilter}
                                onChange={(e) => setLogSubjectFilter(e.target.value)}
                            >
                                <option value="ALL">All Subjects 📖</option>
                                {uniqueSubjects.map(sub => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))}
                            </select>

                            {(logSearchQuery || logMethodFilter !== "ALL" || logSubjectFilter !== "ALL") && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-[10px] font-semibold px-2 py-0 text-muted-foreground hover:text-foreground"
                                    onClick={() => {
                                        setLogSearchQuery("");
                                        setLogMethodFilter("ALL");
                                        setLogSubjectFilter("ALL");
                                    }}
                                >
                                    Reset Filters
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {filteredLogs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground px-4">
                                <History className="w-10 h-10 mb-2 opacity-20" />
                                <p className="text-xs">No matching study logs found.</p>
                            </div>
                        ) : (
                            <div className="divide-y max-h-[300px] overflow-y-auto border-t">
                                <AnimatePresence mode="popLayout">
                                    {filteredLogs.map((log) => {
                                        const task = tasks.find(t => t.id === log.task_id);
                                        return (
                                            <motion.div 
                                                key={log.id} 
                                                layout
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ type: "spring" as any, stiffness: 130, damping: 17 }}
                                                className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors group overflow-hidden"
                                            >
                                                <div className="space-y-1 min-w-0 pr-4">
                                                    <div className="flex items-baseline gap-2 flex-wrap">
                                                        <span className="font-semibold text-sm">
                                                            {log.duration_minutes >= 60
                                                                ? `${Math.floor(log.duration_minutes / 60)}h ${log.duration_minutes % 60}m`
                                                                : `${log.duration_minutes}m`
                                                            }
                                                        </span>
                                                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-secondary/80 border text-muted-foreground uppercase text-[10px]">
                                                            {task?.subject || "Unassigned"}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {formatDistanceToNow(new Date(log.logged_at), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs font-medium text-foreground/80 truncate max-w-sm">
                                                        Task: <span className="underline">{task?.title || "Deleted Target"}</span>
                                                    </p>
                                                    {log.note && (
                                                        <p className="text-[11px] text-muted-foreground leading-normal italic mt-0.5 line-clamp-2 bg-muted/30 p-1.5 rounded border border-dashed">
                                                            Note: &ldquo;{log.note}&rdquo;
                                                        </p>
                                                    )}
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 shrink-0"
                                                    onClick={() => deleteLogMutation.mutate(log.id)}
                                                    disabled={deleteLogMutation.isPending}
                                                    title="Delete study session log"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </CardContent>
                </Card>

            </motion.div>

        </motion.div>
    );
}
