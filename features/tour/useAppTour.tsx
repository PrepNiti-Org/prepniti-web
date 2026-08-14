"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { TOUR_STEPS } from "./tourSteps";
import { TourStep } from "./types";

const STORAGE_KEY = "prepniti_app_tour_completed_v1";

interface TourContextValue {
    isOpen: boolean;
    currentStepIndex: number;
    currentStep: TourStep;
    totalSteps: number;
    hasSeenTour: boolean;
    startTour: (fromIndex?: number) => void;
    stopTour: () => void;
    skipTour: () => void;
    completeTour: () => void;
    nextStep: () => void;
    prevStep: () => void;
    goToStep: (index: number) => void;
    resetTourStatus: () => void;
}

const TourContext = createContext<TourContextValue | undefined>(undefined);

export function TourProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
    const [hasSeenTour, setHasSeenTour] = useState<boolean>(true); // default true until hydrated
    const router = useRouter();
    const pathname = usePathname();

    // Navigate to step's route if necessary
    const syncRouteForStep = useCallback((stepIndex: number) => {
        const step = TOUR_STEPS[stepIndex];
        if (step?.route && pathname !== step.route) {
            router.push(step.route);
        }
    }, [pathname, router]);

    // Hydration & initial check
    useEffect(() => {
        try {
            const seen = localStorage.getItem(STORAGE_KEY);
            if (!seen) {
                setHasSeenTour(false);
                // Gentle delay so initial page layout settles smoothly
                const timer = setTimeout(() => {
                    setIsOpen(true);
                    setCurrentStepIndex(0);
                }, 1400);
                return () => clearTimeout(timer);
            } else {
                setHasSeenTour(true);
            }
        } catch {
            setHasSeenTour(true);
        }
    }, []);

    const completeTour = useCallback(() => {
        setIsOpen(false);
        setHasSeenTour(true);
        try {
            localStorage.setItem(STORAGE_KEY, "true");
        } catch {
            // ignore localStorage quota errors
        }
    }, []);

    const skipTour = useCallback(() => {
        completeTour();
    }, [completeTour]);

    const stopTour = useCallback(() => {
        setIsOpen(false);
    }, []);

    const startTour = useCallback((fromIndex: number = 0) => {
        const validIndex = Math.max(0, Math.min(fromIndex, TOUR_STEPS.length - 1));
        setCurrentStepIndex(validIndex);
        setIsOpen(true);
        syncRouteForStep(validIndex);
    }, [syncRouteForStep]);

    const nextStep = useCallback(() => {
        if (currentStepIndex < TOUR_STEPS.length - 1) {
            const nextIdx = currentStepIndex + 1;
            setCurrentStepIndex(nextIdx);
            syncRouteForStep(nextIdx);
        } else {
            completeTour();
        }
    }, [currentStepIndex, syncRouteForStep, completeTour]);

    const prevStep = useCallback(() => {
        if (currentStepIndex > 0) {
            const prevIdx = currentStepIndex - 1;
            setCurrentStepIndex(prevIdx);
            syncRouteForStep(prevIdx);
        }
    }, [currentStepIndex, syncRouteForStep]);

    const goToStep = useCallback((index: number) => {
        if (index >= 0 && index < TOUR_STEPS.length) {
            setCurrentStepIndex(index);
            syncRouteForStep(index);
        }
    }, [syncRouteForStep]);

    const resetTourStatus = useCallback(() => {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch {
            // ignore
        }
        setHasSeenTour(false);
        startTour(0);
    }, [startTour]);

    // Keyboard Shortcuts (ArrowRight, ArrowLeft, Escape)
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                skipTour();
            } else if (e.key === "ArrowRight") {
                e.preventDefault();
                nextStep();
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                prevStep();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, nextStep, prevStep, skipTour]);

    const currentStep = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];

    return (
        <TourContext.Provider
            value={{
                isOpen,
                currentStepIndex,
                currentStep,
                totalSteps: TOUR_STEPS.length,
                hasSeenTour,
                startTour,
                stopTour,
                skipTour,
                completeTour,
                nextStep,
                prevStep,
                goToStep,
                resetTourStatus,
            }}
        >
            {children}
        </TourContext.Provider>
    );
}

export function useAppTour() {
    const context = useContext(TourContext);
    if (!context) {
        throw new Error("useAppTour must be used within a TourProvider");
    }
    return context;
}
