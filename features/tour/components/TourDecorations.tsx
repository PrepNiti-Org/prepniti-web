"use client";

import React from "react";
import { TargetRect } from "../types";

interface TourDecorationsProps {
    targetRect: TargetRect | null;
    calloutRect: TargetRect | null;
}

export function TourDecorations({ targetRect, calloutRect }: TourDecorationsProps) {
    if (!targetRect || !calloutRect) return null;

    const calloutCenterX = calloutRect.left + calloutRect.width / 2;
    const calloutCenterY = calloutRect.top + calloutRect.height / 2;
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;

    // Anchor from text callout
    let startX = calloutCenterX;
    let startY = calloutCenterY;

    if (calloutCenterY > targetCenterY + targetRect.height / 2) {
        startY = calloutRect.top - 4;
    } else if (calloutCenterY < targetCenterY - targetRect.height / 2) {
        startY = calloutRect.bottom + 4;
    }

    if (calloutCenterX > targetCenterX + targetRect.width / 2) {
        startX = calloutRect.left - 4;
    } else if (calloutCenterX < targetCenterX - targetRect.width / 2) {
        startX = calloutRect.right + 4;
    }

    // Anchor to target edge
    let endX = targetCenterX;
    let endY = targetCenterY;

    if (targetCenterY > calloutCenterY + calloutRect.height / 2) {
        endY = targetRect.top;
    } else if (targetCenterY < calloutCenterY - calloutRect.height / 2) {
        endY = targetRect.bottom;
    }

    if (targetCenterX > calloutCenterX + calloutRect.width / 2) {
        endX = targetRect.left;
    } else if (targetCenterX < calloutCenterX - calloutRect.width / 2) {
        endX = targetRect.right;
    }

    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.hypot(dx, dy);

    if (distance < 15) return null;

    // Hand-drawn organic curve offsets (Excalidraw style)
    const curveOffset = Math.min(Math.max(distance * 0.32, 45), 110);
    const normalX = -dy / distance;
    const normalY = dx / distance;

    const ctrl1X = startX + dx * 0.35 + normalX * (curveOffset * 0.9);
    const ctrl1Y = startY + dy * 0.35 + normalY * (curveOffset * 0.9);
    const ctrl2X = startX + dx * 0.75 + normalX * (curveOffset * 1.1);
    const ctrl2Y = startY + dy * 0.75 + normalY * (curveOffset * 1.1);

    // Primary hand-drawn shaft path
    const mainPath = `M ${startX} ${startY} C ${ctrl1X} ${ctrl1Y}, ${ctrl2X} ${ctrl2Y}, ${endX} ${endY}`;
    // Secondary subtle sketch line for authentic hand-drawn feel
    const sketchPath = `M ${startX + 1} ${startY - 1} C ${ctrl1X - 2} ${ctrl1Y + 1}, ${ctrl2X + 2} ${ctrl2Y - 1}, ${endX} ${endY}`;

    // Angle of arrow tip
    const t = 0.97;
    const pointBeforeEndX = Math.pow(1 - t, 3) * startX + 3 * Math.pow(1 - t, 2) * t * ctrl1X + 3 * (1 - t) * Math.pow(t, 2) * ctrl2X + Math.pow(t, 3) * endX;
    const pointBeforeEndY = Math.pow(1 - t, 3) * startY + 3 * Math.pow(1 - t, 2) * t * ctrl1Y + 3 * (1 - t) * Math.pow(t, 2) * ctrl2Y + Math.pow(t, 3) * endY;
    const arrowAngle = Math.atan2(endY - pointBeforeEndY, endX - pointBeforeEndX);

    // Hand-drawn open chevron arrowhead wings
    const headLength = 22;
    const headAngle = 0.45; // ~26 degrees
    
    // Left wing
    const wing1X = endX - headLength * Math.cos(arrowAngle - headAngle);
    const wing1Y = endY - headLength * Math.sin(arrowAngle - headAngle);
    // Right wing
    const wing2X = endX - headLength * Math.cos(arrowAngle + headAngle);
    const wing2Y = endY - headLength * Math.sin(arrowAngle + headAngle);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden">
            <svg className="w-full h-full">
                {/* Secondary sketch layer for rough hand-drawn texture */}
                <path
                    d={sketchPath}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.35"
                />

                {/* Primary hand-drawn curved arrow shaft */}
                <path
                    d={mainPath}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.95"
                />

                {/* Hand-drawn open chevron arrowhead wings (Excalidraw style) */}
                <path
                    d={`M ${wing1X} ${wing1Y} Q ${endX - (endX - wing1X) * 0.3} ${endY - (endY - wing1Y) * 0.3} ${endX} ${endY} Q ${endX - (endX - wing2X) * 0.3} ${endY - (endY - wing2Y) * 0.3} ${wing2X} ${wing2Y}`}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.95"
                />

                {/* Hand-drawn sketchy start circle */}
                <circle cx={startX} cy={startY} r="3.5" fill="#ffffff" />
            </svg>
        </div>
    );
}

// Hand-drawn sketchy spotlight border around target
export function HandDrawnTargetBox({ rect }: { rect: TargetRect }) {
    const { top, left, width, height } = rect;
    const rx = 12;

    // A slightly wavy, hand-drawn outline box
    const p1 = `M ${left} ${top + rx} Q ${left} ${top} ${left + rx} ${top} L ${left + width - rx} ${top + 1} Q ${left + width} ${top} ${left + width} ${top + rx} L ${left + width - 1} ${top + height - rx} Q ${left + width} ${top + height} ${left + width - rx} ${top + height} L ${left + rx} ${top + height - 1} Q ${left} ${top + height} ${left} ${top + height - rx} Z`;
    const p2 = `M ${left + 1} ${top + rx} Q ${left - 1} ${top - 1} ${left + rx} ${top - 1} L ${left + width - rx} ${top} Q ${left + width + 1} ${top - 1} ${left + width} ${top + rx} L ${left + width} ${top + height - rx} Q ${left + width + 1} ${top + height + 1} ${left + width - rx} ${top + height} L ${left + rx} ${top + height} Q ${left - 1} ${top + height + 1} ${left} ${top + height - rx} Z`;

    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-[9995]">
            <path
                d={p1}
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.9"
            />
            <path
                d={p2}
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.4"
            />
        </svg>
    );
}
