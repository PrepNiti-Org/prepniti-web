export const TIMER_STORAGE_KEY = "prepniti_study_timer";

export interface TimerState {
    taskId: string;
    taskTitle: string;
    elapsed: number; // seconds accumulated before the current running window
    isRunning: boolean;
    startedAt: number | null; // unix ms timestamp of when current run window started
}

export function getStoredTimer(): TimerState | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(TIMER_STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function storeTimer(state: TimerState | null) {
    if (typeof window === "undefined") return;
    if (state) {
        localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
    } else {
        localStorage.removeItem(TIMER_STORAGE_KEY);
    }
}

/**
 * Compute the TRUE elapsed seconds from the stored timer state using
 * wall-clock arithmetic (Date.now - startedAt). This is immune to
 * browser setInterval throttling in background tabs.
 */
export function getActualElapsed(state: TimerState): number {
    if (state.isRunning && state.startedAt !== null) {
        const windowSeconds = Math.floor((Date.now() - state.startedAt) / 1000);
        return state.elapsed + windowSeconds;
    }
    return state.elapsed;
}

export function formatTime(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// Dispatch a custom event so other components react to timer changes
export function dispatchTimerUpdate() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("timer-update"));
    }
}
