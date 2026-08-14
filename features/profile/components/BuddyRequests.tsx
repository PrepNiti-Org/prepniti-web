"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPendingRequests, respondBuddyRequest, removeBuddy } from "../api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export function BuddyRequests() {
    const queryClient = useQueryClient();

    const { data: requests, isLoading } = useQuery({
        queryKey: ["buddy-requests"],
        queryFn: getPendingRequests,
    });

    const respondRequestMutation = useMutation({
        mutationFn: ({ connId, accept }: { connId: string; accept: boolean }) => respondBuddyRequest(connId, accept),
        onSuccess: (_, variables) => {
            toast.success(variables.accept ? "Request Accepted" : "Request Ignored", {
                description: variables.accept ? "You are now buddies!" : "Request has been removed.",
            });
            queryClient.invalidateQueries({ queryKey: ["buddies"] });
            queryClient.invalidateQueries({ queryKey: ["buddy-requests"] });
            queryClient.invalidateQueries({ queryKey: ["buddy-feed"] });
        },
        onError: (err: any) => {
            toast.error("Error Responding to Request", {
                description: err.response?.data?.error || "Action failed.",
            });
        },
    });

    const removeBuddyMutation = useMutation({
        mutationFn: (buddyId: string) => removeBuddy(buddyId),
        onSuccess: () => {
            toast.success("Request Cancelled", {
                description: "The buddy request has been cancelled.",
            });
            queryClient.invalidateQueries({ queryKey: ["buddy-requests"] });
        },
        onError: (err: any) => {
            toast.error("Error Cancelling Request", {
                description: err.response?.data?.error || "Action failed.",
            });
        },
    });

    if (isLoading) {
        return (
            <Card className="border-border/50">
                <CardHeader className="pb-3 border-b bg-gradient-to-r from-muted/60 to-transparent">
                    <CardTitle className="text-base font-bold">Pending Buddy Requests</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <div className="h-12 bg-muted/40 animate-pulse rounded-xl" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/50">
            <CardHeader className="pb-3 border-b bg-gradient-to-r from-muted/60 to-transparent">
                <CardTitle className="text-base font-bold">Pending Buddy Requests</CardTitle>
                <CardDescription className="text-xs">Incoming requests requiring action, and outgoing requests awaiting response.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground/80 mb-3 flex items-center gap-1.5">
                        Incoming Requests
                        {requests?.incoming && requests.incoming.length > 0 && (
                            <Badge className="bg-red-500 text-white font-black text-[9px] px-1 py-0">{requests.incoming.length}</Badge>
                        )}
                    </h3>
                    {!requests?.incoming || requests.incoming.length === 0 ? (
                        <p className="text-xs text-muted-foreground/70 italic py-2">No incoming buddy requests.</p>
                    ) : (
                        <div className="space-y-3">
                            {requests.incoming.map((req) => (
                                <div key={req.connection_id} className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-muted/5">
                                    <div className="min-w-0">
                                        <Link href={`/profile/${req.peer_username}`} className="text-sm font-black text-foreground hover:text-primary block">
                                            @{req.peer_username}
                                        </Link>
                                        {req.peer_target && (
                                            <p className="text-[10px] text-muted-foreground">Target: {req.peer_target}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => respondRequestMutation.mutate({ connId: req.connection_id, accept: true })}
                                            disabled={respondRequestMutation.isPending}
                                            className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                        >
                                            Accept
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => respondRequestMutation.mutate({ connId: req.connection_id, accept: false })}
                                            disabled={respondRequestMutation.isPending}
                                            className="h-8 text-destructive border-destructive/20 hover:bg-destructive/5 font-bold"
                                        >
                                            Decline
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Separator />

                <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground/80 mb-3">Outgoing Requests</h3>
                    {!requests?.outgoing || requests.outgoing.length === 0 ? (
                        <p className="text-xs text-muted-foreground/70 italic py-2">No outgoing requests sent.</p>
                    ) : (
                        <div className="space-y-3">
                            {requests.outgoing.map((req) => (
                                <div key={req.connection_id} className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-muted/5">
                                    <div className="min-w-0">
                                        <Link href={`/profile/${req.peer_username}`} className="text-sm font-black text-foreground hover:text-primary block">
                                            @{req.peer_username}
                                        </Link>
                                        <p className="text-[10px] text-muted-foreground/60">Sent {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => removeBuddyMutation.mutate(req.connection_id)}
                                        disabled={removeBuddyMutation.isPending}
                                        className="h-8 text-xs font-bold border-rose-500/10 text-rose-500 hover:bg-rose-500/5 hover:border-rose-500/30"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
