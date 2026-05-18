"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { Task, getUserTimeLogs, DailyEntry } from "../api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Target, CheckCircle2, Clock, BookOpen, Flame, Timer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend as RechartsLegend } from "recharts";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

function getDateRange(days: number): { from: string; to: string } {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    return {
        from: from.toISOString().split("T")[0],
        to: to.toISOString().split("T")[0],
    };
}

function calculateStreak(dailyData: DailyEntry[]): number {
    const dateSet = new Set(dailyData.map(d => d.date));
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        if (dateSet.has(dateStr)) {
            streak++;
        } else {
            // Allow skipping today if it hasn't been logged yet
            if (i === 0) continue;
            break;
        }
    }
    return streak;
}

function StudyHeatmap({ dailyData }: { dailyData: DailyEntry[] }) {
    const dailyMap = useMemo(() => {
        const map: Record<string, number> = {};
        dailyData.forEach(d => { map[d.date] = d.minutes; });
        return map;
    }, [dailyData]);

    // Generate last 91 days (13 weeks)
    const days = useMemo(() => {
        const result: { date: string; minutes: number; dayOfWeek: number }[] = [];
        const today = new Date();
        for (let i = 90; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split("T")[0];
            result.push({
                date: dateStr,
                minutes: dailyMap[dateStr] || 0,
                dayOfWeek: d.getDay(),
            });
        }
        return result;
    }, [dailyMap]);

    // Group into weeks
    const weeks = useMemo(() => {
        const w: typeof days[] = [];
        let currentWeek: typeof days = [];
        days.forEach(day => {
            if (day.dayOfWeek === 0 && currentWeek.length > 0) {
                w.push(currentWeek);
                currentWeek = [];
            }
            currentWeek.push(day);
        });
        if (currentWeek.length > 0) w.push(currentWeek);
        return w;
    }, [days]);

    const getIntensity = (minutes: number) => {
        if (minutes === 0) return "bg-muted/40";
        if (minutes < 30) return "bg-green-200 dark:bg-green-900/60";
        if (minutes < 60) return "bg-green-400 dark:bg-green-700/80";
        if (minutes < 120) return "bg-green-500 dark:bg-green-600";
        return "bg-green-600 dark:bg-green-500";
    };

    const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];

    return (
        <div className="space-y-2">
            <div className="flex gap-0.5">
                {/* Day labels */}
                <div className="flex flex-col gap-0.5 mr-1">
                    {dayLabels.map((label, i) => (
                        <div key={i} className="h-3 w-6 text-[9px] text-muted-foreground flex items-center justify-end pr-1">
                            {label}
                        </div>
                    ))}
                </div>
                {/* Heatmap grid */}
                <TooltipProvider delayDuration={100}>
                    <div className="flex gap-0.5">
                        {weeks.map((week, wi) => (
                            <div key={wi} className="flex flex-col gap-0.5">
                                {/* Pad the first week if it doesn't start on Sunday */}
                                {wi === 0 && Array.from({ length: week[0].dayOfWeek }).map((_, pi) => (
                                    <div key={`pad-${pi}`} className="h-3 w-3 rounded-[2px]" />
                                ))}
                                {week.map(day => (
                                    <Tooltip key={day.date}>
                                        <TooltipTrigger asChild>
                                            <div
                                                className={`h-3 w-3 rounded-[2px] ${getIntensity(day.minutes)} transition-colors cursor-default`}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="text-xs">
                                            <p className="font-medium">{day.minutes > 0 ? `${day.minutes} min` : "No study"}</p>
                                            <p className="text-muted-foreground">{new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        ))}
                    </div>
                </TooltipProvider>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-1.5 justify-end text-[9px] text-muted-foreground">
                <span>Less</span>
                <div className="h-3 w-3 rounded-[2px] bg-muted/40" />
                <div className="h-3 w-3 rounded-[2px] bg-green-200 dark:bg-green-900/60" />
                <div className="h-3 w-3 rounded-[2px] bg-green-400 dark:bg-green-700/80" />
                <div className="h-3 w-3 rounded-[2px] bg-green-500 dark:bg-green-600" />
                <div className="h-3 w-3 rounded-[2px] bg-green-600 dark:bg-green-500" />
                <span>More</span>
            </div>
        </div>
    );
}

export function TaskAnalyticsView({ tasks }: { tasks: Task[] }) {
    const { from, to } = getDateRange(90);
    const { data: timeLogData } = useQuery({
        queryKey: ["userTimeLogs", from, to],
        queryFn: () => getUserTimeLogs(from, to),
    });

    if (tasks.length === 0) {
        return <div className="text-center py-20 text-muted-foreground">No data available for analytics yet. Add some tasks!</div>;
    }

    const dailyData = timeLogData?.daily || [];
    const totalLoggedMinutes = timeLogData?.total_minutes || 0;
    const streak = calculateStreak(dailyData);

    // Today's total
    const todayStr = new Date().toISOString().split("T")[0];
    const todayMinutes = dailyData.find(d => d.date === todayStr)?.minutes || 0;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "DONE").length;
    const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const totalEstimatedHours = tasks.reduce((sum, task) => sum + (task.estimated_hours || 0), 0);
    const totalLoggedHours = Math.round(totalLoggedMinutes / 60);
    const timeRate = totalEstimatedHours === 0 ? 0 : Math.min(100, Math.round((totalLoggedHours / totalEstimatedHours) * 100));

    const uniqueSubjects = Array.from(new Set(tasks.map(t => t.subject).filter(Boolean)));
    const subjectsStarted = new Set(tasks.filter(t => t.status !== "TODO").map(t => t.subject)).size;
    const coverageRate = uniqueSubjects.length === 0 ? 0 : Math.round((subjectsStarted / uniqueSubjects.length) * 100);

    const ringSeries = [completionRate, timeRate, coverageRate];
    const ringOptions: unknown = {
        chart: { type: 'radialBar', background: 'transparent', fontFamily: 'inherit' },
        plotOptions: {
            radialBar: {
                hollow: { margin: 10, size: '30%', background: 'transparent' },
                track: { show: true, background: '#2A2A2A', strokeWidth: '100%', margin: 8 },
                dataLabels: {
                    name: { fontSize: '18px', color: '#ffffff', fontWeight: 600 },
                    value: { fontSize: '14px', color: '#a1a1aa', formatter: (val: number) => `${val}%` },
                    total: {
                        show: true,
                        label: 'Targets',
                        color: '#F91149',
                        formatter: () => `${completionRate}%`
                    }
                }
            }
        },
        stroke: { lineCap: 'round' },
        colors: ['#F91149', '#A6FA0F', '#00DFE8'],
        labels: ['Targets Hit', 'Time Invested', 'Syllabus Coverage'],
    };

    const barData = uniqueSubjects.map(subject => {
        const subjectTasks = tasks.filter(t => t.subject === subject);
        return {
            subject: subject.length > 10 ? subject.substring(0, 10) + "..." : subject,
            Total: subjectTasks.length,
            Completed: subjectTasks.filter(t => t.status === "DONE").length,
        };
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Targets</CardTitle><Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{totalTasks}</div><p className="text-xs text-muted-foreground">Across all subjects</p></CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completion Rate</CardTitle><CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{completionRate}%</div><p className="text-xs text-muted-foreground">{completedTasks} targets hit</p></CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Study Streak</CardTitle><Flame className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{streak} day{streak !== 1 ? "s" : ""}</div><p className="text-xs text-muted-foreground">Consecutive study days</p></CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today&apos;s Study</CardTitle><Timer className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {todayMinutes >= 60 ? `${Math.floor(todayMinutes / 60)}h ${todayMinutes % 60}m` : `${todayMinutes}m`}
                        </div>
                        <p className="text-xs text-muted-foreground">Total: {totalLoggedHours}h / {totalEstimatedHours}h est.</p>
                    </CardContent>
                </Card>
            </div>

            {/* Heatmap Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Flame className="h-5 w-5 text-green-500" /> Study Activity</CardTitle>
                    <CardDescription>Your study activity over the past 3 months</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <StudyHeatmap dailyData={dailyData} />
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                <Card className="col-span-1 lg:col-span-2 overflow-hidden bg-[#0a0a0a] border-zinc-800">
                    <CardHeader className="pb-0 border-b border-white/5 mb-4">
                        <CardTitle className="text-zinc-100">Study Rings</CardTitle>
                        <CardDescription className="text-zinc-400 mb-4">Close your rings to conquer the syllabus.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center p-0 pb-6">
                        <div className="w-full max-w-[320px]">
                            {/* @ts-expect-error - Suppress apexcharts typescript warning */}
                            <ReactApexChart options={ringOptions} series={ringSeries} type="radialBar" height={340} />
                        </div>

                        <div className="flex flex-wrap justify-center gap-4 mt-2 px-4">
                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#F91149]" /><span className="text-xs text-zinc-300">Targets</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#A6FA0F]" /><span className="text-xs text-zinc-300">Time</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#00DFE8]" /><span className="text-xs text-zinc-300">Coverage</span></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1 lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Subject Mastery</CardTitle>
                        <CardDescription>Compare total targets vs completed targets per subject.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                                <XAxis dataKey="subject" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <RechartsLegend iconType="circle" />
                                <Bar dataKey="Total" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                <Bar dataKey="Completed" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}