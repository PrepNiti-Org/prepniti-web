"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useAppTour } from "../useAppTour";
import { TargetRect } from "../types";
import { TourDecorations, HandDrawnTargetBox } from "./TourDecorations";

export function AppTour() {
    const {
        isOpen,
        currentStepIndex,
        currentStep,
        totalSteps,
        nextStep,
        prevStep,
        skipTour,
    } = useAppTour();

    const pathname = usePathname();
    const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
    const [calloutRect, setCalloutRect] = useState<TargetRect | null>(null);
    const calloutRef = useRef<HTMLDivElement>(null);

    // Measure target element position with retries for route transitions
    const updateTargetRect = useCallback(() => {
        if (!isOpen) {
            setTargetRect(null);
            return;
        }

        const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
        const selector = (isMobile && currentStep.mobileTargetSelector)
            ? currentStep.mobileTargetSelector
            : currentStep.targetSelector;

        if (!selector) {
            setTargetRect(null);
            return;
        }

        const element = document.querySelector(selector);
        if (element) {
            const rect = element.getBoundingClientRect();
            // Scroll target smoothly so it is comfortably centered in the visible viewport
            if (
                rect.top < 70 ||
                rect.bottom > window.innerHeight - 80 ||
                rect.left < 10 ||
                rect.right > window.innerWidth - 10
            ) {
                element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
            }

            const padding = 8;
            setTargetRect({
                top: Math.max(0, rect.top - padding),
                left: Math.max(0, rect.left - padding),
                width: rect.width + padding * 2,
                height: rect.height + padding * 2,
                bottom: rect.bottom + padding,
                right: rect.right + padding,
            });
        } else {
            setTargetRect(null);
        }
    }, [isOpen, currentStep]);

    // Measure text callout rect for arrow connection
    const updateCalloutRect = useCallback(() => {
        if (calloutRef.current) {
            const rect = calloutRef.current.getBoundingClientRect();
            setCalloutRect({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
                bottom: rect.bottom,
                right: rect.right,
            });
        }
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        updateTargetRect();
        updateCalloutRect();

        let attempts = 0;
        const interval = setInterval(() => {
            updateTargetRect();
            updateCalloutRect();
            attempts++;
            if (attempts > 8) clearInterval(interval);
        }, 150);

        const handleResizeOrScroll = () => {
            updateTargetRect();
            updateCalloutRect();
        };

        window.addEventListener("resize", handleResizeOrScroll);
        window.addEventListener("scroll", handleResizeOrScroll, true);

        return () => {
            clearInterval(interval);
            window.removeEventListener("resize", handleResizeOrScroll);
            window.removeEventListener("scroll", handleResizeOrScroll, true);
        };
    }, [isOpen, currentStepIndex, pathname, updateTargetRect, updateCalloutRect]);

    if (!isOpen) return null;

    // Calculate dynamic, responsive floating text position relative to target
    const getCalloutPositionStyle = (): React.CSSProperties => {
        const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
        const winWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
        const winHeight = typeof window !== "undefined" ? window.innerHeight : 800;

        const textWidth = isMobile ? Math.min(winWidth - 32, 360) : 440;

        if (currentStep.placement === "center" || !targetRect) {
            return {
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: `${textWidth}px`,
                maxWidth: "92vw",
                zIndex: 9999,
            };
        }

        let top = 0;
        let left = 0;

        if (isMobile) {
            // On mobile, check whether target is in top half or bottom half of viewport
            const spaceBelow = winHeight - targetRect.bottom - 75; // 75px bottom nav clearance
            const spaceAbove = targetRect.top - 60; // 60px top navbar clearance

            if (spaceAbove > spaceBelow && spaceAbove >= 130) {
                // Place comfortably above target with an arrow pointing down
                top = Math.max(65, targetRect.top - 150);
            } else if (spaceBelow >= 130) {
                // Place comfortably below target with an arrow pointing up
                top = Math.min(winHeight - 200, targetRect.bottom + 45);
            } else {
                // Large element: place where there is more space
                top = spaceBelow >= spaceAbove
                    ? Math.min(winHeight - 200, targetRect.bottom + 20)
                    : Math.max(65, targetRect.top - 140);
            }

            // Horizontally center relative to target, clamped to screen
            const targetCenterX = targetRect.left + targetRect.width / 2;
            left = Math.max(16, Math.min(targetCenterX - textWidth / 2, winWidth - textWidth - 16));
        } else {
            // Desktop: relative to placement
            const placement = currentStep.placement || "bottom";
            const targetCenterX = targetRect.left + targetRect.width / 2;
            const targetCenterY = targetRect.top + targetRect.height / 2;

            if (placement === "bottom") {
                const spaceBelow = winHeight - targetRect.bottom;
                if (spaceBelow < 170 && targetRect.top > 180) {
                    // Flip to top if bottom is cramped
                    top = Math.max(65, targetRect.top - 160);
                } else {
                    top = Math.min(winHeight - 180, targetRect.bottom + 85);
                }
                left = Math.max(24, Math.min(targetCenterX - textWidth / 2, winWidth - textWidth - 24));
            } else if (placement === "top") {
                top = Math.max(65, targetRect.top - 160);
                left = Math.max(24, Math.min(targetCenterX - textWidth / 2, winWidth - textWidth - 24));
            } else if (placement === "right") {
                top = Math.max(65, Math.min(targetCenterY - 60, winHeight - 180));
                left = Math.min(winWidth - textWidth - 24, targetRect.right + 70);
            } else if (placement === "left") {
                top = Math.max(65, Math.min(targetCenterY - 60, winHeight - 180));
                left = Math.max(24, targetRect.left - textWidth - 70);
            }
        }

        // Final safety clamping
        left = Math.max(16, Math.min(left, winWidth - textWidth - 16));
        top = Math.max(60, Math.min(top, winHeight - 160));

        return {
            position: "fixed",
            top: `${top}px`,
            left: `${left}px`,
            width: `${textWidth}px`,
            maxWidth: "92vw",
            zIndex: 9999,
        };
    };

    return (
        <div className="fixed inset-0 z-[9990] overflow-hidden select-none">
            {/* SVG Mask Spotlight Backdrop */}
            <svg className="absolute inset-0 w-full h-full pointer-events-auto">
                <defs>
                    <mask id="tour-spotlight-mask">
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        {targetRect && (
                            <rect
                                x={targetRect.left}
                                y={targetRect.top}
                                width={targetRect.width}
                                height={targetRect.height}
                                rx="12"
                                fill="black"
                            />
                        )}
                    </mask>
                </defs>
                <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="rgba(3, 7, 18, 0.82)"
                    mask="url(#tour-spotlight-mask)"
                    onClick={skipTour}
                    className="cursor-pointer"
                />
            </svg>

            {/* Hand-Drawn Sketchy Target Box (Excalidraw Style) */}
            {targetRect && (
                <HandDrawnTargetBox rect={targetRect} />
            )}

            {/* Long Hand-Drawn Connection Arrow */}
            {targetRect && (
                <TourDecorations
                    targetRect={targetRect}
                    calloutRect={calloutRect}
                />
            )}

            {/* Pure Unboxed Handwritten Floating Text (Excalidraw / Chalk Style) */}
            <div style={getCalloutPositionStyle()} className="pointer-events-none">
                <div
                    ref={calloutRef}
                    className="space-y-1.5 pointer-events-auto select-none font-[family-name:var(--font-handwritten)] px-1"
                >
                    {/* Step Tag */}
                    <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg font-bold text-white/70 tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                            Step {currentStepIndex + 1} of {totalSteps} ~
                        </span>
                    </div>

                    {/* Handwritten Headline */}
                    <h3 className="text-2xl sm:text-4xl font-bold text-white tracking-tight leading-none drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                        {currentStep.title}
                    </h3>

                    {/* Handwritten Description */}
                    <p className="text-lg sm:text-2xl text-white/95 leading-snug font-normal drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] pt-0.5">
                        {currentStep.description}
                    </p>

                    {/* Hand-drawn styled controls */}
                    <div className="flex items-center gap-3 pt-2 text-lg sm:text-xl font-bold">
                        {currentStepIndex > 0 && (
                            <button
                                onClick={prevStep}
                                className="text-white/80 hover:text-white transition-colors cursor-pointer drop-shadow flex items-center gap-0.5 hover:underline decoration-wavy"
                            >
                                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" /> back
                            </button>
                        )}

                        <button
                            onClick={nextStep}
                            className="text-white hover:text-white/90 transition-all cursor-pointer drop-shadow flex items-center gap-1 px-3.5 py-0.5 sm:px-4 sm:py-1 rounded-2xl border-2 border-white/80 hover:border-white shadow-[0_2px_10px_rgba(0,0,0,0.5)] hover:scale-105 active:scale-95"
                        >
                            {currentStepIndex === totalSteps - 1 ? "finish!" : "next →"}
                        </button>

                        <button
                            onClick={skipTour}
                            className="text-sm sm:text-base text-white/50 hover:text-white transition-colors ml-2 cursor-pointer"
                        >
                            skip (esc)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
