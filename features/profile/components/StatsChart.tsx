"use client";

import { Activity } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface StatsChartProps {
    data: {
        id: string;
        exam_name: string;
        score: number;
        max_score: number;
        percentage: number;
        month: string;
        attempted_at: string;
    }[];
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-card text-foreground border border-border p-3.5 rounded-xl shadow-lg space-y-1 text-xs font-sans">
                <p className="font-bold text-foreground truncate max-w-[220px]">{data.exam_name}</p>
                <div className="pt-1 space-y-1">
                    <p className="text-muted-foreground flex justify-between gap-4">
                        Score: <span className="font-mono font-bold text-primary">{data.score} / {data.max_score}</span>
                    </p>
                    <p className="text-muted-foreground flex justify-between gap-4">
                        Accuracy: <span className="font-mono font-bold text-emerald-500">{Math.round(data.percentage)}%</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 pt-1 border-t border-border/40 mt-1 font-semibold">
                        {new Date(data.attempted_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

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
                        dataKey="attempted_at"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => {
                            if (!value) return "";
                            try {
                                return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
                            } catch (_) {
                                return "";
                            }
                        }}
                    />
                    <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="percentage"
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