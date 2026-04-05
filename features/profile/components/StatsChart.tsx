"use client";

import { Activity } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface StatsChartProps {
    data: { month: string; score: number }[];
}

export function StatsChart({ data }: StatsChartProps) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
        <div className="h-[300px] w-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg mt-4 bg-muted/10">
            <Activity className="h-10 w-10 mb-2 opacity-20" />
            <p className="text-sm font-medium">No test data available yet.</p>
            <p className="text-xs opacity-70">Take a mock test to see your progress here.</p>
        </div>
        );
    }

    return (
        <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="month"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}
                        itemStyle={{ color: 'var(--foreground)' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="score"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorScore)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}