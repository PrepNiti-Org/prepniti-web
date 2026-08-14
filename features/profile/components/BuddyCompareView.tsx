"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, BarChart2, Flame, BookOpen, Swords } from "lucide-react";
import { getBuddyComparison, BuddyComparisonUser, DailyStudyEntry, DailyMockEntry } from "@/features/profile/api";
import { format, eachDayOfInterval, subDays } from "date-fns";

interface BuddyCompareViewProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    buddyUsername: string;
    myUsername: string;
}

type Tab = "study" | "mock";

function mergeTimeSeries<T extends { day: string }>(
    meData: T[] | null,
    buddyData: T[] | null,
    valueKey: keyof T,
    meKey: string,
    buddyKey: string
) {
    const me = meData ?? [];
    const buddy = buddyData ?? [];
    const end = new Date();
    const start = subDays(end, 29);
    const days = eachDayOfInterval({ start, end });

    const meMap = new Map(me.map((d) => [d.day, Number(d[valueKey])]));
    const buddyMap = new Map(buddy.map((d) => [d.day, Number(d[valueKey])]));

    return days.map((d) => {
        const key = format(d, "yyyy-MM-dd");
        return {
            date: format(d, "MMM d"),
            [meKey]: meMap.get(key) ?? 0,
            [buddyKey]: buddyMap.get(key) ?? 0,
        };
    });
}

function StatChip({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
    return (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${color}`}>
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <div className="min-w-0">
                <p className="text-[9px] text-muted-foreground">{label}</p>
                <p className="text-xs font-black truncate">{value}</p>
            </div>
        </div>
    );
}

function UserHeader({ user, color }: { user: BuddyComparisonUser; color: string }) {
    const initials = user.username.substring(0, 2).toUpperCase();
    const study = user.study ?? [];
    const mock = user.mock ?? [];
    const totalStudyMins = study.reduce((s, d) => s + d.minutes, 0);
    const avgMock = mock.length > 0
        ? Math.round(mock.reduce((s, d) => s + d.avg_pct, 0) / mock.length)
        : 0;

    return (
        <div className="flex flex-col items-center gap-2 text-center">
            <Avatar className={`h-10 w-10 border-2 ${color}`}>
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}&backgroundColor=6d28d9`} />
                <AvatarFallback className="text-xs font-black bg-primary/20 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div>
                <p className="text-xs font-black">@{user.username}</p>
                <div className="flex items-center gap-1 justify-center mt-0.5">
                    <Flame className="h-2.5 w-2.5 text-amber-500" />
                    <span className="text-[9px] text-muted-foreground">{user.streak}d streak</span>
                </div>
            </div>
            <div className="flex gap-2 text-[9px]">
                <div className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary font-bold">
                    {Math.round(totalStudyMins / 60)}h studied
                </div>
                {avgMock > 0 && (
                    <div className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold">
                        {avgMock}% avg mock
                    </div>
                )}
            </div>
        </div>
    );
}

const tooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "12px",
    fontSize: "11px",
    color: "hsl(var(--foreground))",
};

export function BuddyCompareView({ open, onOpenChange, buddyUsername, myUsername }: BuddyCompareViewProps) {
    const [activeTab, setActiveTab] = useState<Tab>("study");

    const { data, isLoading } = useQuery({
        queryKey: ["buddy-compare", buddyUsername],
        queryFn: () => getBuddyComparison(buddyUsername),
        enabled: open && !!buddyUsername,
        staleTime: 5 * 60_000,
    });

    const studyData = data
        ? mergeTimeSeries(
            data.me.study as DailyStudyEntry[],
            data.buddy.study as DailyStudyEntry[],
            "minutes",
            "you",
            "buddy"
        )
        : [];

    const mockData = data
        ? mergeTimeSeries(
            data.me.mock as DailyMockEntry[],
            data.buddy.mock as DailyMockEntry[],
            "avg_pct",
            "you",
            "buddy"
        )
        : [];

    const mockFiltered = mockData.filter((d) => Number(d.you) > 0 || Number(d.buddy) > 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-sm font-black">
                        <Swords className="h-4 w-4 text-primary" />
                        Stats Comparison
                        <span className="text-muted-foreground font-normal">— last 30 days</span>
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-20 w-full rounded-xl" />
                        <Skeleton className="h-48 w-full rounded-xl" />
                    </div>
                ) : data ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-border/30 bg-muted/5">
                            <UserHeader user={data.me} color="border-primary/50" />
                            <UserHeader user={data.buddy} color="border-violet-500/50" />
                        </div>

                        <div className="flex gap-1 p-1 bg-muted/30 rounded-xl border border-border/40">
                            <button
                                onClick={() => setActiveTab("study")}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "study"
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <BookOpen className="h-3.5 w-3.5" />
                                Study Hours
                            </button>
                            <button
                                onClick={() => setActiveTab("mock")}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "mock"
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <BarChart2 className="h-3.5 w-3.5" />
                                Mock Scores
                            </button>
                        </div>

                        {activeTab === "study" && (
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                                    <TrendingUp className="h-3.5 w-3.5" /> Daily study minutes — last 30 days
                                </p>
                                <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={studyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorYou" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorBuddy" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.35} />
                                                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                                            tickLine={false}
                                            interval={4}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(v) => `${v}m`}
                                        />
                                        <Tooltip
                                            contentStyle={tooltipStyle}
                                            formatter={(value, name) => [
                                                `${value}m`,
                                                name === "you" ? `@${myUsername}` : `@${buddyUsername}`,
                                            ]}
                                        />
                                        <Legend
                                            formatter={(value) =>
                                                value === "you" ? `@${myUsername}` : `@${buddyUsername}`
                                            }
                                            wrapperStyle={{ fontSize: 10 }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="you"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={2}
                                            fill="url(#colorYou)"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="buddy"
                                            stroke="#7c3aed"
                                            strokeWidth={2}
                                            fill="url(#colorBuddy)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {activeTab === "mock" && (
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                                    <BarChart2 className="h-3.5 w-3.5" /> Mock test avg score % — last 30 days
                                </p>
                                {mockFiltered.length === 0 ? (
                                    <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                                        No mock test data yet
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={mockFiltered} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(v) => `${v}%`}
                                                domain={[0, 100]}
                                            />
                                            <Tooltip
                                                contentStyle={tooltipStyle}
                                                formatter={(value, name) => [
                                                    `${Number(value).toFixed(1)}%`,
                                                    name === "you" ? `@${myUsername}` : `@${buddyUsername}`,
                                                ]}
                                            />
                                            <Legend
                                                formatter={(value) =>
                                                    value === "you" ? `@${myUsername}` : `@${buddyUsername}`
                                                }
                                                wrapperStyle={{ fontSize: 10 }}
                                            />
                                            <Bar dataKey="you" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.85} />
                                            <Bar dataKey="buddy" fill="#7c3aed" radius={[4, 4, 0, 0]} opacity={0.85} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">
                        Failed to load comparison data
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
