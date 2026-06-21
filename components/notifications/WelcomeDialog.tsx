"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Target, ShieldCheck, ArrowRight } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface WelcomeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function WelcomeDialog({ open, onOpenChange }: WelcomeDialogProps) {
    const router = useRouter();
    const { user } = useAuth();

    const username = user?.username || "Aspirant";

    const handleNavigate = (path: string) => {
        onOpenChange(false);
        router.push(path);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg sm:rounded-2xl p-6 overflow-hidden border-primary/20 bg-card/95 backdrop-blur-md shadow-2xl">

                <div className="absolute top-0 right-0 -mr-16 -mt-16 h-36 w-36 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-36 w-36 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

                <DialogHeader className="flex flex-col items-center text-center space-y-3 pt-4">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                        <Sparkles className="h-7 w-7 text-primary animate-pulse" />
                    </div>
                    <DialogTitle className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-foreground to-secondary bg-clip-text text-transparent">
                        Welcome to PrepNiti, {username}! 🎉
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5 my-4 text-sm text-foreground/80 leading-relaxed text-left">
                    <p>
                        We are thrilled to welcome you to our community! We know that preparing for competitive exams is a demanding journey. PrepNiti was built to be your ultimate companion—providing a private, structured space to collaborate, learn, and succeed.
                    </p>

                    <div className="space-y-4 pt-2 border-t border-border/40">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quick Onboarding Guide:</h4>

                        <div className="flex gap-3 items-start">
                            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0 mt-0.5">
                                <ShieldCheck className="h-4 w-4" />
                            </div>
                            <div>
                                <h5 className="font-bold text-foreground text-[13px]">100% Private & Secure</h5>
                                <p className="text-xs text-muted-foreground mt-0.5">Share your stresses, doubts, and tips anonymously. Speaks your mind without judgment.</p>
                            </div>
                        </div>

                        <div className="flex gap-3 items-start">
                            <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0 mt-0.5">
                                <Target className="h-4 w-4" />
                            </div>
                            <div>
                                <h5 className="font-bold text-foreground text-[13px]">Personal Study Tracker</h5>
                                <p className="text-xs text-muted-foreground mt-0.5">Set targets, prioritize daily work, and visualize your exam syllabus coverage on the board.</p>
                            </div>
                        </div>

                        <div className="flex gap-3 items-start">
                            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 shrink-0 mt-0.5">
                                <Sparkles className="h-4 w-4" />
                            </div>
                            <div>
                                <h5 className="font-bold text-foreground text-[13px]">Peer Connections & Insights</h5>
                                <p className="text-xs text-muted-foreground mt-0.5">Access preparation reviews from successful candidates and interact with peers targeting similar exams.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mt-4 w-full">
                    <Button
                        onClick={() => handleNavigate("/tracker")}
                        className="flex-1 font-bold h-10 rounded-xl transition-all shadow-sm shadow-primary/10"
                    >
                        Go to Study Tracker
                        <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => handleNavigate("/posts")}
                        className="flex-1 font-bold h-10 rounded-xl"
                    >
                        Explore Feed
                    </Button>
                </div>

                <div className="text-center pt-2">
                    <Button
                        variant="link"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        className="text-xs text-muted-foreground hover:text-foreground h-auto p-0"
                    >
                        Dismiss for now
                    </Button>
                </div>

            </DialogContent>
        </Dialog>
    );
}
