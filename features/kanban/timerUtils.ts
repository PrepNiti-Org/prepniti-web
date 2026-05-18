export const TIMER_STORAGE_KEY = "prepniti_study_timer";

export interface TimerState {
    taskId: string;
    taskTitle: string;
    elapsed: number; // seconds
    isRunning: boolean;
    startedAt: number | null; // timestamp
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
