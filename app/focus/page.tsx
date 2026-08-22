"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FocusRoom } from "@/features/focus";
import { Skeleton } from "@/components/ui/skeleton";

function FocusPageContent() {
    const searchParams = useSearchParams();
    const taskId = searchParams.get("taskId") || undefined;

    return <FocusRoom initialTaskId={taskId} />;
}

export default function FocusPage() {
    return (
        <Suspense
            fallback={
                <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center">
                    <Skeleton className="h-24 w-80 rounded-3xl" />
                </div>
            }
        >
            <FocusPageContent />
        </Suspense>
    );
}
