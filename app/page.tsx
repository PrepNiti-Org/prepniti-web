import { Metadata } from "next";
import { FeedClient } from "@/features/experiences/components/FeedClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PenSquare, BookOpen } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "PrepNiti | Real Interview Experiences for Aspirants",
  description: "Read verified interview transcripts for UPSC, State PSC, and Banking exams. Share your journey and track your syllabus progress.",
  openGraph: {
    title: "PrepNiti Community",
    description: "The ultimate community for government job aspirants.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <div className="container max-w-7xl mx-auto space-y-8">

      <div className="border border-primary/20 rounded-3xl p-8 md:p-12 text-center space-y-4 relative overflow-hidden shadow-lg shadow-primary/5 bg-gradient-to-b from-primary/10 via-primary/[0.03] to-transparent">
        <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/80">
            Real Interview Experiences.<br className="hidden sm:block" /> From Real Aspirants.
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            PrepNiti is the ultimate community for UPSC, PSC, and Banking aspirants. Read verified interview transcripts and boost your preparation.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/submit">
              <Button size="lg" className="font-semibold shadow-md hover:shadow-lg transition-all">
                <PenSquare className="mr-2 h-4 w-4" /> Share Experience
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="bg-background shadow-sm hover:bg-muted/50 transition-all">
                <BookOpen className="mr-2 h-4 w-4" /> Syllabus Tracker
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        <div className="lg:col-span-3">
          <FeedClient />
        </div>

        <div className="hidden lg:block space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Contribute to PrepNiti</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Your interview experience could be the roadmap for someone else&apos;s success.
              </p>
              <Link href="/submit">
                <Button className="w-full">Create a Post</Button>
              </Link>
            </CardContent>
          </Card>

          <div className="text-xs text-muted-foreground/60 flex flex-wrap gap-x-3 gap-y-1 px-2">
            <Link href="/about" className="hover:underline hover:text-primary">About</Link>
            <Link href="/privacy" className="hover:underline hover:text-primary">Privacy</Link>
            <Link href="/terms" className="hover:underline hover:text-primary">Terms</Link>
            <span>© {new Date().getFullYear()} PrepNiti</span>
          </div>
        </div>

      </div>
    </div>
  );
}