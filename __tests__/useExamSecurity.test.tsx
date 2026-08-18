import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useExamSecurity, isFullscreenSupported, isDocumentFullscreen } from "../app/mock-tests/_components/useExamSecurity";

describe("useExamSecurity Hook", () => {
    let onSubmitMock: ReturnType<typeof vi.fn>;
    let onSubmitRef: { current: (reason?: string) => void };

    beforeEach(() => {
        vi.useFakeTimers();
        onSubmitMock = vi.fn();
        onSubmitRef = { current: onSubmitMock };
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it("should detect when fullscreen API is supported and active", () => {
        Object.defineProperty(document, "fullscreenEnabled", {
            configurable: true,
            value: true,
        });
        expect(isFullscreenSupported()).toBe(true);

        Object.defineProperty(document, "fullscreenElement", {
            configurable: true,
            value: document.documentElement,
        });
        expect(isDocumentFullscreen()).toBe(true);

        Object.defineProperty(document, "fullscreenElement", {
            configurable: true,
            value: null,
        });
        expect(isDocumentFullscreen()).toBe(false);
    });

    it("should not trigger security violation during initial grace period", () => {
        Object.defineProperty(document, "fullscreenEnabled", {
            configurable: true,
            value: true,
        });
        Object.defineProperty(document, "fullscreenElement", {
            configurable: true,
            value: null,
        });

        renderHook(() => useExamSecurity("testing", onSubmitRef));

        // Trigger fullscreen change during grace period (< 1500ms)
        act(() => {
            document.dispatchEvent(new Event("fullscreenchange"));
        });

        expect(onSubmitMock).not.toHaveBeenCalled();

        // Advance timers past grace period (1500ms)
        act(() => {
            vi.advanceTimersByTime(1600);
        });

        // Now trigger fullscreen change
        act(() => {
            document.dispatchEvent(new Event("fullscreenchange"));
        });

        expect(onSubmitMock).toHaveBeenCalledWith("Exited fullscreen mode");
    });

    it("should trigger violation on tab switch / visibility change to hidden", () => {
        renderHook(() => useExamSecurity("testing", onSubmitRef));

        act(() => {
            vi.advanceTimersByTime(1600);
        });

        Object.defineProperty(document, "visibilityState", {
            configurable: true,
            value: "hidden",
        });

        act(() => {
            document.dispatchEvent(new Event("visibilitychange"));
        });

        expect(onSubmitMock).toHaveBeenCalledWith("Switched browser tabs or minimized window");
    });

    it("should debounce blur and trigger violation if window remains blurred", () => {
        renderHook(() => useExamSecurity("testing", onSubmitRef));

        act(() => {
            vi.advanceTimersByTime(1600);
        });

        Object.defineProperty(document, "hasFocus", {
            configurable: true,
            value: () => false,
        });

        act(() => {
            window.dispatchEvent(new Event("blur"));
        });

        expect(onSubmitMock).not.toHaveBeenCalled();

        // Advance 800ms debounce
        act(() => {
            vi.advanceTimersByTime(850);
        });

        expect(onSubmitMock).toHaveBeenCalledWith("Lost window focus");
    });

    it("should cancel blur violation if window regains focus quickly", () => {
        renderHook(() => useExamSecurity("testing", onSubmitRef));

        act(() => {
            vi.advanceTimersByTime(1600);
        });

        act(() => {
            window.dispatchEvent(new Event("blur"));
        });

        // User quickly refocuses (e.g. within 300ms)
        act(() => {
            vi.advanceTimersByTime(300);
            window.dispatchEvent(new Event("focus"));
        });

        // Advance beyond 800ms
        act(() => {
            vi.advanceTimersByTime(600);
        });

        expect(onSubmitMock).not.toHaveBeenCalled();
    });

    it("should reset state and allow security enforcement on subsequent exam attempts", () => {
        const { rerender } = renderHook(
            ({ step }) => useExamSecurity(step, onSubmitRef),
            { initialProps: { step: "testing" } }
        );

        act(() => {
            vi.advanceTimersByTime(1600);
        });

        // Test attempt 1 triggers violation
        Object.defineProperty(document, "visibilityState", {
            configurable: true,
            value: "hidden",
        });
        act(() => {
            document.dispatchEvent(new Event("visibilitychange"));
        });
        expect(onSubmitMock).toHaveBeenCalledTimes(1);

        // Step returns to result -> setup -> instructions -> testing
        rerender({ step: "result" });
        rerender({ step: "setup" });
        rerender({ step: "instructions" });

        const nextSubmitMock = vi.fn();
        onSubmitRef.current = nextSubmitMock;

        rerender({ step: "testing" });

        act(() => {
            vi.advanceTimersByTime(1600);
        });

        // Test attempt 2 should correctly catch security violation
        act(() => {
            document.dispatchEvent(new Event("visibilitychange"));
        });
        expect(nextSubmitMock).toHaveBeenCalledWith("Switched browser tabs or minimized window");
    });
});
