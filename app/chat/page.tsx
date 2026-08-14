"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { ChatWorkspace } from "@/features/chat/components/ChatWorkspace";

export default function ChatPage() {
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background">
                <p className="text-sm text-muted-foreground font-semibold">Please sign in to access chat.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 h-full w-full flex flex-col overflow-hidden">
            <ChatWorkspace />
        </div>
    );
}
