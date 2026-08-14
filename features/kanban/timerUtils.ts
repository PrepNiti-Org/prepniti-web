export interface ActiveSession {
    sessionId: string;
    taskId: string;
    taskTitle: string;
    /** Unix-ms timestamp of when the current run window started. null if paused. */
    startedAt: number | null;
    /** Seconds accumulated from all previous run windows (confirmed by server). */
    accumulatedSeconds: number;
    isPaused: boolean;
}

/**
 * Returns the TRUE elapsed seconds for a session using wall-clock arithmetic.
 *
 *   - Running : accumulatedSeconds + floor((Date.now() - startedAt) / 1000)
 *   - Paused  : accumulatedSeconds
 *
 * This is NEVER affected by setInterval throttling or browser background-tab
 * slowdowns because it always computes from a raw timestamp.
 */
export function getDisplayElapsed(session: ActiveSession): number {
    if (!session.isPaused && session.startedAt !== null) {
        return session.accumulatedSeconds + Math.floor((Date.now() - session.startedAt) / 1000);
    }
    return session.accumulatedSeconds;
}

export function formatTime(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/**
 * Dispatch a session-update event so every mounted timer component
 * (NavbarTimer, StudyTimer) instantly reflects the new state without
 * requiring a round-trip API call.
 *
 * Consumers: window.addEventListener("session-update", handler)
 * The event detail is ActiveSession | null.
 */
export function dispatchSessionUpdate(session: ActiveSession | null): void {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent<ActiveSession | null>("session-update", { detail: session }));
    }
}
