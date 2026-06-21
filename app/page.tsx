import { Metadata } from "next";
import { HeroCTA } from "@/features/auth/components/HeroCTA";
import { HomeContent } from "@/features/auth/components/HomeContent";
import Link from "next/link";


export const metadata: Metadata = {
  title: "PrepNiti — Exam Prep, Honestly",
  description:
    "Study logs, mock tests, kanban planner, interview experiences and a community — all anonymous. Built for UPSC, PSC, Banking and every serious aspirant.",
  openGraph: {
    title: "PrepNiti — Exam Prep, Honestly",
    description: "The prep platform built by aspirants, for aspirants.",
    type: "website",
  },
};

const WHAT_WE_HAVE = [
  { label: "Interview Experiences", desc: "Detailed transcripts from real board interviews — UPSC, PSC, Banking.", href: "/" },
  { label: "Full Mock Tests", desc: "Timed, auto-scored tests that match actual exam patterns.", href: "/mock-tests" },
  { label: "Study Time Tracker", desc: "Log sessions, build streaks, see where your hours actually go.", href: "/tracker" },
  { label: "Kanban Planner", desc: "Drag topics across Not Started → In Progress → Revised.", href: "/tracker" },
  { label: "Progress Insights", desc: "Charts that make your consistency (and gaps) impossible to ignore.", href: "/insights" },
  { label: "Community Posts", desc: "Open threads — strategy, doubts, wins. No real names required.", href: "/posts" },
];

export default function HomePage() {
  return (
    <div className="container max-w-7xl mx-auto">

      <section className="pt-10 pb-12 md:pt-16 md:pb-16 border-b border-border/40">
        <div className="max-w-3xl space-y-6">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary">
            PrepNiti
          </p>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05] text-foreground">
            Everything your prep<br className="hidden sm:block" />
            needs. Nothing it{" "}
            <span className="relative inline-block">
              <span className="relative z-10">doesn't.</span>
              <span
                className="absolute bottom-1 left-0 right-0 h-[6px] rounded-full opacity-40"
                style={{ background: "hsl(15 100% 57%)" }}
              />
            </span>
          </h1>

          <p className="text-muted-foreground text-base md:text-lg max-w-xl leading-relaxed">
            Mock tests, study tracking, kanban planner, interview experiences, and a live community — all in one anonymous space.
          </p>

          <HeroCTA />
        </div>
      </section>

      <section className="py-10 border-b border-border/40">
        <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground/60 mb-6">
          What's inside
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-0">
          {WHAT_WE_HAVE.map((item, i) => (
            <Link
              key={item.label}
              href={item.href}
              className="group flex items-start gap-4 py-4 border-t border-border/30 hover:border-primary/30 transition-colors"
            >
              <span className="text-[11px] font-bold text-muted-foreground/40 w-5 mt-0.5 shrink-0 tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {item.label}
                </p>
                <p className="text-[12px] text-muted-foreground leading-relaxed mt-0.5">
                  {item.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <HomeContent />

    </div>
  );
}

