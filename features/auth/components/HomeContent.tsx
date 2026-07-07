"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { FeedClient } from "@/features/experiences/components/FeedClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PenSquare, ArrowRight, Lock, Layers, ShieldCheck, BarChart3 } from "lucide-react";
import Link from "next/link";

function AuthedFeed() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-6">
                    <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground/60">
                        Recent experiences
                    </p>
                    <Link href="/submit">
                        <Button variant="ghost" size="sm" className="text-xs font-bold gap-1.5 h-7 px-3 rounded-lg">
                            <PenSquare className="h-3 w-3" /> Share yours
                        </Button>
                    </Link>
                </div>
                <FeedClient />
            </div>

            <aside className="hidden lg:block space-y-8 pt-9">
                <Card className="border-border/50 bg-card/50 rounded-2xl shadow-none">
                    <CardHeader className="pb-3 pt-5 px-5">
                        <CardTitle className="text-sm font-bold">Share your experience</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                            Wrote an interview recently? Your notes could save someone 3 months of guesswork.
                        </p>
                        <Link href="/submit">
                            <Button size="sm" className="w-full rounded-xl font-bold text-xs h-8">
                                Write it up
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <div className="text-[11px] text-muted-foreground/40 flex flex-wrap gap-x-3 gap-y-1.5 px-1">
                    <Link href="/about" className="hover:text-muted-foreground transition-colors">About</Link>
                    <Link href="/privacy" className="hover:text-muted-foreground transition-colors">Privacy</Link>
                    <Link href="/terms" className="hover:text-muted-foreground transition-colors">Terms</Link>
                    <Link href="/feedback" className="hover:text-muted-foreground transition-colors">Feedback</Link>
                    <span>© {new Date().getFullYear()} PrepNiti</span>
                </div>
            </aside>
        </div>
    );
}

const STATS = [
    { value: "Focused", label: "No ads, no distractions", icon: BarChart3, color: "text-primary" },
    { value: "Anonymous", label: "No real name. No photo", icon: ShieldCheck, color: "text-emerald-500" },
    { value: "All-in-one", label: "Mocks, tracker, community", icon: Layers, color: "text-violet-500" },
];

const WHY = [
    {
        num: "01",
        title: "Everything in one place",
        body: "Most aspirants juggle 4–5 apps for tracking, mocks, and notes. PrepNiti brings all of that into one focused space so you stop switching between tools and start studying.",
    },
    {
        num: "02",
        title: "Fully anonymous",
        body: "No real name, no photo, no social profile. Your username is the only identity here. Share doubts and struggles without worrying who\'s watching.",
    },
    {
        num: "03",
        title: "Structured practice",
        body: "From timed mock tests to an easy topic progress board, every tool is designed to mimic actual exam conditions and keep you consistent.",
    },
];

const TEASER_CARDS = [
    { exam: "UPSC CSE 2024", board: "Delhi", result: "Selected" },
    { exam: "SBI PO 2024", board: "Mumbai", result: "Waitlist" },
    { exam: "SSC CGL 2024", board: "Jaipur", result: "Selected" },
];

function GuestLanding() {
    return (
        <div className="pt-10 space-y-20">

            <div className="grid grid-cols-3 gap-4 max-w-xl">
                {STATS.map(s => (
                    <div
                        key={s.label}
                        className="flex flex-col gap-2 p-4 rounded-2xl border border-border/40 bg-card hover:border-primary/20 hover:bg-card/80 transition-colors"
                    >
                        <s.icon className={`h-5 w-5 ${s.color}`} />
                        <div>
                            <p className="text-lg md:text-xl font-black text-foreground tracking-tight">{s.value}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <section>
                <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground/60 mb-6">
                    Why aspirants stick around
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-0">
                    {WHY.map(w => (
                        <div key={w.num} className="py-6 border-t border-border/30 space-y-2">
                            <span className="text-[11px] font-bold text-muted-foreground/40 tabular-nums">{w.num}</span>
                            <p className="text-sm font-bold text-foreground">{w.title}</p>
                            <p className="text-[12px] text-muted-foreground leading-relaxed">{w.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="relative">
                <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground/60 mb-6">
                    Recent experiences
                </p>

                <div className="space-y-3 blur-[3px] select-none pointer-events-none" aria-hidden>
                    {TEASER_CARDS.map((c, i) => (
                        <div
                            key={i}
                            className="border border-border/40 rounded-2xl p-5 bg-card/50 flex items-start justify-between gap-4"
                        >
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{c.exam}</span>
                                    <span className="text-[10px] text-muted-foreground/50">·</span>
                                    <span className="text-[10px] text-muted-foreground/50">{c.board}</span>
                                </div>
                                <div className="h-3 w-3/4 rounded bg-muted/60" />
                                <div className="h-3 w-1/2 rounded bg-muted/40" />
                                <div className="h-3 w-2/3 rounded bg-muted/40" />
                            </div>
                            <div className="text-right shrink-0 space-y-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.result === "Selected" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}>
                                    {c.result}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="absolute inset-x-0 bottom-0 top-12 flex flex-col items-center justify-center gap-5 bg-gradient-to-t from-background via-background/90 to-transparent rounded-2xl px-6 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm shadow-primary/10">
                            <Lock className="h-5 w-5 text-primary" />
                        </div>
                        <p className="text-base font-bold text-foreground">
                            Create a free account to read experiences
                        </p>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            No real name required. Takes 30 seconds to set up.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/register">
                            <Button className="font-bold rounded-xl px-6 h-10 shadow-lg shadow-primary/20">
                                Sign up free
                            </Button>
                        </Link>
                        <Link
                            href="/login"
                            className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        >
                            Log in <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>
            </section>

            <footer className="pb-10 text-[11px] text-muted-foreground/40 flex flex-wrap gap-x-3 gap-y-1.5">
                <Link href="/about" className="hover:text-muted-foreground transition-colors">About</Link>
                <Link href="/privacy" className="hover:text-muted-foreground transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-muted-foreground transition-colors">Terms</Link>
                <Link href="/feedback" className="hover:text-muted-foreground transition-colors">Feedback</Link>
                <span>© {new Date().getFullYear()} PrepNiti</span>
            </footer>
        </div>
    );
}

export function HomeContent() {
    const { isLoggedIn, isHydrated } = useAuth();

    if (!isHydrated) {
        return <div className="pt-10 h-64" />;
    }

    return isLoggedIn ? <AuthedFeed /> : <GuestLanding />;
}
