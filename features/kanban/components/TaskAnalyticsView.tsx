"use client";

import dynamic from "next/dynamic";
import { Task } from "../api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Target, CheckCircle2, Clock, BookOpen } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend as RechartsLegend } from "recharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export function TaskAnalyticsView({ tasks }: { tasks: Task[] }) {
    if (tasks.length === 0) {
        return <div className="text-center py-20 text-muted-foreground">No data available for analytics yet. Add some tasks!</div>;
    }

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "DONE").length;
    const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const totalHours = tasks.reduce((sum, task) => sum + (task.estimated_hours || 0), 0);
    const completedHours = tasks.filter(t => t.status === "DONE").reduce((sum, task) => sum + (task.estimated_hours || 0), 0);
    const timeRate = totalHours === 0 ? 0 : Math.round((completedHours / totalHours) * 100);

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
                        <CardTitle className="text-sm font-medium">Active Subjects</CardTitle><BookOpen className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{uniqueSubjects.length}</div><p className="text-xs text-muted-foreground">Currently studying</p></CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Study Effort</CardTitle><Clock className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{completedHours} / {totalHours}h</div><p className="text-xs text-muted-foreground">Estimated hours completed</p></CardContent>
                </Card>
            </div>

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