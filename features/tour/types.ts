import { LucideIcon } from "lucide-react";

export type TourPlacement = "top" | "bottom" | "left" | "right" | "center" | "auto";

export interface TourStep {
    id: string;
    targetSelector?: string; // CSS selector or data-tour identifier (e.g. '[data-tour="navbar-search"]')
    mobileTargetSelector?: string;
    title: string;
    subtitle?: string;
    description: string;
    icon?: LucideIcon;
    badge?: string;
    highlightPoints?: string[];
    placement?: TourPlacement;
    actionLabel?: string;
    actionHref?: string;
    route?: string; // Route the user can jump to if desired
}

export interface TargetRect {
    top: number;
    left: number;
    width: number;
    height: number;
    bottom: number;
    right: number;
}
