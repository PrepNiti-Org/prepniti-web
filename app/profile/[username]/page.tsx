"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getPublicProfile } from "@/features/profile/api";
import { StatsChart } from "@/features/profile/components/StatsChart";
import { PublicProfileHero } from "@/features/profile/components/PublicProfileHero";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { UserX, Lock, ArrowLeft, FileText } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function PublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    const username = params.username as string;

    const { data: profile, isLoading, error } = useQuery({
        queryKey: ["public-profile", username],
        queryFn: () => getPublicProfile(username),
        retry: false,
    });

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto space-y-8 p-4">
                <Skeleton className="h-56 w-full rounded-2xl" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Skeleton className="h-80 rounded-2xl" />
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-48 rounded-2xl" />
                        <Skeleton className="h-48 rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        const isPrivate = (error as any)?.response?.status === 403;

        return (
            <div className="max-w-md mx-auto mt-20 text-center space-y-6 p-4">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
                    {isPrivate ? <Lock className="h-8 w-8" /> : <UserX className="h-8 w-8" />}
                </div>
                <div>
                    <h2 className="text-xl font-black text-foreground">
                        {isPrivate ? "Private Profile" : "User Not Found"}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        {isPrivate
                            ? `@${username}'s profile is private. You need to be their buddy to see their progress.`
                            : `We couldn't find a user with the username @${username}.`}
                    </p>
                </div>

                <Button variant="outline" onClick={() => router.back()} className="font-semibold">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
                </Button>
            </div>
        );
    }

    return (
        <motion.div
            className="max-w-6xl mx-auto space-y-8 p-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants}>
                <PublicProfileHero profile={profile} username={username} />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                    <Card className="border-border/50 overflow-hidden">
                        <CardHeader className="pb-3 border-b bg-gradient-to-r from-muted/60 to-transparent">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <BarChart3Icon className="h-4 w-4 text-primary" />
                                Mock Test Progression
                            </CardTitle>
                            <CardDescription className="text-xs mt-0.5">Mock score percentages over recent attempts.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <StatsChart data={profile.stats || []} />
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 overflow-hidden">
                        <CardHeader className="pb-3 border-b bg-gradient-to-r from-muted/60 to-transparent">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <FileText className="h-4 w-4 text-violet-500" />
                                Recent Contributions
                            </CardTitle>
                            <CardDescription className="text-xs mt-0.5">Experiences shared by @{profile.username}.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {!profile.contributions?.length ? (
                                <div className="text-center py-10 text-muted-foreground text-xs">
                                    No contributions shared yet.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {profile.contributions.map((item: any) => (
                                        <div
                                            key={item.id}
                                            className="flex items-start gap-3 p-3 rounded-xl border border-border/40 hover:bg-muted/20 transition-colors"
                                        >
                                            <div className="p-1.5 rounded-lg bg-primary/10 text-primary mt-0.5 shrink-0">
                                                <FileText className="h-3.5 w-3.5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-foreground leading-tight">{item.title}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">{item.details}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-5 lg:col-span-1">
                    <Card className="border-border/50">
                        <CardHeader className="pb-2 pt-4 px-4">
                            <CardTitle className="text-sm font-bold text-muted-foreground">About Candidate</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground text-xs">Username</span>
                                <span className="font-bold text-xs text-foreground">@{profile.username}</span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground text-xs">Target Exam</span>
                                <Badge variant="outline" className="text-[10px] capitalize font-bold">{profile.target_exam || "None Set"}</Badge>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground text-xs">Privacy Status</span>
                                <Badge variant="outline" className="text-[10px] capitalize bg-green-500/5 text-green-500 border-green-500/20 font-bold">
                                    {profile.is_public ? "Public Profile" : "Buddy Only"}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}

// Simple fallback icon to avoid import issues
function BarChart3Icon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M3 3v18h18" />
            <path d="M18 17V9" />
            <path d="M13 17V5" />
            <path d="M8 17v-3" />
        </svg>
    );
}
