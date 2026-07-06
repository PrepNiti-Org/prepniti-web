"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBuddies, getPendingRequests } from "@/features/profile/api";
import { getMyPacts } from "@/features/profile/pact_api";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Users, Swords } from "lucide-react";
import { AddBuddyForm } from "@/features/profile/components/AddBuddyForm";
import { BuddyActivityFeed } from "@/features/profile/components/BuddyActivityFeed";
import { BuddyList } from "@/features/profile/components/BuddyList";
import { BuddyRequests } from "@/features/profile/components/BuddyRequests";
import { BuddyRecommendations } from "@/features/profile/components/BuddyRecommendations";
import { StudyPactCard } from "@/features/profile/components/StudyPactCard";

export default function BuddiesDashboardPage() {
    const [activeTab, setActiveTab] = useState<"feed" | "buddies" | "requests">("feed");
    const { user } = useAuth();

    const { data: buddies } = useQuery({
        queryKey: ["buddies"],
        queryFn: getBuddies,
    });

    const { data: requests } = useQuery({
        queryKey: ["buddy-requests"],
        queryFn: getPendingRequests,
    });

    const { data: pacts } = useQuery({
        queryKey: ["my-pacts"],
        queryFn: getMyPacts,
    });

    const activePacts = pacts?.filter((p) => p.status === "active") ?? [];

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-4">
            <div className="relative rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 via-primary/5 to-violet-500/10 p-8 shadow-sm">
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
                            <Users className="h-8 w-8 text-primary" /> Buddy Portal
                        </h1>
                        <p className="text-sm text-muted-foreground mt-2 max-w-xl leading-relaxed">
                            Connect with other aspirants, keep track of each other's streaks, check mock test progress, and stay accountable.
                        </p>
                    </div>

                    <AddBuddyForm />
                </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="w-full">
                        <div className="w-full flex justify-start bg-muted/30 border border-border/50 rounded-xl p-1 mb-6 gap-1">
                            <button
                                onClick={() => setActiveTab("feed")}
                                className={`rounded-lg font-bold text-xs py-2 px-4 transition-all ${activeTab === "feed" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                Activity Feed
                            </button>
                            <button
                                onClick={() => setActiveTab("buddies")}
                                className={`rounded-lg font-bold text-xs py-2 px-4 transition-all flex items-center gap-1.5 ${activeTab === "buddies" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                My Buddies
                                {buddies && buddies.length > 0 && (
                                    <Badge variant="secondary" className="h-4 min-w-4 p-0 px-1 text-[9px] bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-black">
                                        {buddies.length}
                                    </Badge>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab("requests")}
                                className={`rounded-lg font-bold text-xs py-2 px-4 transition-all flex items-center gap-1.5 ${activeTab === "requests" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                Pending Requests
                                {requests && requests.incoming.length > 0 && (
                                    <Badge className="h-4 min-w-4 p-0 px-1 text-[9px] bg-red-500 text-white flex items-center justify-center font-black">
                                        {requests.incoming.length}
                                    </Badge>
                                )}
                            </button>
                        </div>

                        {activeTab === "feed" && <BuddyActivityFeed />}
                        {activeTab === "buddies" && <BuddyList />}
                        {activeTab === "requests" && <BuddyRequests />}
                    </div>

                    {activePacts.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Swords className="h-4 w-4 text-primary" />
                                <h2 className="text-sm font-black tracking-tight">Active Study Pacts</h2>
                                <Badge className="text-[9px] bg-primary/10 text-primary border border-primary/20 font-black">
                                    {activePacts.length}
                                </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {activePacts.map((pact) => (
                                    <StudyPactCard
                                        key={pact.id}
                                        pact={pact}
                                        currentUsername={user?.username}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6 lg:col-span-1">
                    <BuddyRecommendations />

                    {pacts && pacts.filter(p => p.status !== "active").length > 0 && (
                        <div className="space-y-3">
                            <p className="text-xs font-black text-muted-foreground flex items-center gap-1">
                                <Swords className="h-3.5 w-3.5" /> Past Pacts
                            </p>
                            {pacts.filter(p => p.status !== "active").map((pact) => (
                                <StudyPactCard
                                    key={pact.id}
                                    pact={pact}
                                    currentUsername={user?.username}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
