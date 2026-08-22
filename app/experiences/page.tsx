import { Metadata } from "next";
import { FeedClient } from "@/features/experiences/components/FeedClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PenSquare } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Interview Experiences - PrepNiti",
    description: "Read and share authentic interview board transcripts, exam strategies, and preparation insights.",
};

export default function ExperiencesPage() {
    return (
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-10">
                <div className="lg:col-span-3">
                    <FeedClient
                        action={
                            <Link href="/submit" className="lg:hidden">
                                <Button variant="ghost" size="sm" className="text-[11px] font-bold gap-1.5 h-7 px-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 shrink-0">
                                    <PenSquare className="h-3 w-3" /> Share
                                </Button>
                            </Link>
                        }
                    />
                </div>

                <aside className="hidden lg:block space-y-8 pt-9 lg:sticky lg:top-0 lg:self-start">
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
        </div>
    );
}
