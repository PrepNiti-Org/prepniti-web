"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserActivity, getUserProfile, getUserStats } from "@/features/profile/api";
import { StatsChart } from "@/features/profile/components/StatsChart";
import { EditProfileDialog } from "@/features/profile/components/EditProfileDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Calendar, Target, Award } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ProfilePage() {
    const { data: user, isLoading: isUserLoading } = useQuery({
        queryKey: ["profile"],
        queryFn: getUserProfile,
    });

    const { data: stats, isLoading: isStatsLoading } = useQuery({
        queryKey: ["profile-stats"],
        queryFn: getUserStats,
    });

    const { data: activity, isLoading: isActivityLoading } = useQuery({
        queryKey: ["profile-activity"],
        queryFn: getUserActivity,
    });

    if (isUserLoading || isStatsLoading || isActivityLoading) {
        return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    if (!user) return <div className="text-center mt-20">Please log in to view your profile.</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
                    <p className="text-muted-foreground mt-1">Manage your account settings and view your progress.</p>
                </div>
                
                <EditProfileDialog user={user} />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6 lg:col-span-1"
                >
                    <Card>
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`} />
                                <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <h2 className="mt-4 text-xl font-bold">{user.username}</h2>
                            <p className="text-sm text-muted-foreground mb-4">{user.role}</p>

                            {user.bio && (
                                <p className="text-sm text-center italic text-muted-foreground px-4 mb-4">
                                &quot;{user.bio}&quot;
                                </p>
                            )}

                            <div className="w-full space-y-3 mt-4 border-t pt-4 text-sm">
                                <div className="flex items-center justify-between text-muted-foreground">
                                    <span className="flex items-center"><Mail className="mr-2 h-4 w-4" /> Email</span>
                                    <span className="text-foreground font-medium">{user.email}</span>
                                </div>
                                <div className="flex items-center justify-between text-muted-foreground">
                                    <span className="flex items-center"><Target className="mr-2 h-4 w-4" /> Target Exam</span>
                                    <span className="text-foreground font-medium">{user.target_exam || "--"}</span>
                                </div>
                                <div className="flex items-center justify-between text-muted-foreground">
                                    <span className="flex items-center"><Calendar className="mr-2 h-4 w-4" /> Joined</span>
                                    <span className="text-foreground font-medium">
                                        {new Date(user.joined_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Award className="h-4 w-4 text-primary" /> Current Streak
                        </CardTitle>
                        </CardHeader>
                        <CardContent>
                        <p className="text-3xl font-bold text-primary">{activity?.streak || 0} Days</p>
                        <p className="text-xs text-muted-foreground mt-1">Keep it up! Consistency is key.</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 space-y-6"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Mock Test Progression</CardTitle>
                            <CardDescription>Your average scores over the last 5 months.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <StatsChart data={stats || []} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                        <CardTitle>Recent Contributions</CardTitle>
                        <CardDescription>Experiences and posts you&apos;ve shared with the community.</CardDescription>
                        </CardHeader>
                        <CardContent>
                        <div className="space-y-4">
                            
                            {!activity?.contributions?.length ? (
                            <div className="text-sm text-muted-foreground italic py-4 text-center">
                                You haven&apos;t shared any experiences yet.
                            </div>
                            ) : (
                            activity.contributions.map((item) => (
                                <div key={item.id} className="flex flex-col border-b last:border-0 pb-4 last:pb-0">
                                <span className="text-sm font-semibold">{item.title}</span>
                                <span className="text-xs text-muted-foreground mt-1">{item.details}</span>
                                </div>
                            ))
                            )}
                            
                        </div>
                        
                        {(activity?.contributions?.length ?? 0) > 0 && (
                            <Link href="/profile/posts" className="w-full">
                                <Button variant="ghost" className="w-full mt-4 text-primary">
                                    View All Posts
                                </Button>
                            </Link>
                        )}
                        </CardContent>
                    </Card>

                </motion.div>
            </div>
        </div>
    );
}