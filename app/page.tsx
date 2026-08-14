import { Metadata } from "next";
import { HeroCTA } from "@/features/auth/components/HeroCTA";
import { HomeContent } from "@/features/auth/components/HomeContent";
import Link from "next/link";
import {
    GraduationCap, Target, BarChart3, BookOpen, Users, Zap, ArrowRight
} from "lucide-react";

export const metadata: Metadata = {
    title: "PrepNiti — Exam Prep, Honestly",
    description:
        "Study logs, mock tests, topic planner, interview experiences and a community — all anonymous. Built for UPSC, PSC, Banking and every serious aspirant.",
    openGraph: {
        title: "PrepNiti — Exam Prep, Honestly",
        description: "The prep platform built by aspirants, for aspirants.",
        type: "website",
    },
};

const FEATURES = [
    {
        icon: BookOpen,
        label: "Interview Experiences",
        desc: "Detailed transcripts from real board interviews — UPSC, PSC, Banking.",
        href: "/",
        color: "text-violet-500",
        bg: "bg-violet-500/10",
        border: "border-violet-500/20",
    },
    {
        icon: GraduationCap,
        label: "Full Mock Tests",
        desc: "Timed, auto-scored tests that match actual exam patterns.",
        href: "/mock-tests",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
    },
    {
        icon: Zap,
        label: "Study Time Tracker",
        desc: "Log sessions, build streaks, see where your hours actually go.",
        href: "/tracker",
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
    },
    {
        icon: Target,
        label: "Topic Planner",
        desc: "Drag topics across Not Started → In Progress → Revised.",
        href: "/tracker",
        color: "text-primary",
        bg: "bg-primary/10",
        border: "border-primary/20",
    },
    {
        icon: BarChart3,
        label: "Progress Insights",
        desc: "Charts that make your consistency (and gaps) impossible to ignore.",
        href: "/insights",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
    },
    {
        icon: Users,
        label: "Community Posts",
        desc: "Open threads — strategy, doubts, wins. No real names required.",
        href: "/posts",
        color: "text-rose-500",
        bg: "bg-rose-500/10",
        border: "border-rose-500/20",
    },
];

export default function HomePage() {
    return (
        <div className="container max-w-7xl mx-auto">

            {/* <section className="pt-10 pb-12 md:pt-16 md:pb-16 border-b border-border/40">
                <div className="max-w-3xl space-y-6">
                    <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary">
                        PrepNiti
                    </p>

                    <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05] text-foreground">
                        Everything your prep<br className="hidden sm:block" />
                        needs. Nothing it{" "}
                        <span className="relative inline-block">
                            <span className="relative z-10">doesn&apos;t.</span>
                            <span
                                className="absolute bottom-1 left-0 right-0 h-[6px] rounded-full opacity-40"
                                style={{ background: "hsl(15 100% 57%)" }}
                            />
                        </span>
                    </h1>

                    <p className="text-muted-foreground text-base md:text-lg max-w-xl leading-relaxed">
                        Mock tests, study tracking, topic planner, interview experiences, and a live community — all in one anonymous space.
                    </p>

                    <HeroCTA />
                </div>
            </section>

            <section className="py-12 border-b border-border/40">
                <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground/60 mb-8">
                    What&apos;s inside
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {FEATURES.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`group relative flex flex-col gap-4 p-5 rounded-2xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 bg-card ${item.border} hover:border-opacity-60`}
                        >
                            <div className={`inline-flex items-center justify-center h-10 w-10 rounded-xl ${item.bg} ${item.color} border ${item.border}`}>
                                <item.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className={`text-sm font-bold text-foreground group-hover:${item.color} transition-colors mb-1`}>
                                    {item.label}
                                </p>
                                <p className="text-[12px] text-muted-foreground leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                            <ArrowRight className={`absolute top-4 right-4 h-4 w-4 ${item.color} opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5`} />
                        </Link>
                    ))}
                </div>
            </section> */}

            <HomeContent />

        </div>
    );
}
