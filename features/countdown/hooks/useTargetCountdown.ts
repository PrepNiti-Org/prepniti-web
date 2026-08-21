"use client";

import { useState, useEffect, useMemo } from "react";
import {
    differenceInDays,
    differenceInMonths,
    differenceInHours,
    differenceInMinutes,
    differenceInSeconds,
    addMonths,
    parseISO,
    isValid,
    startOfDay,
    isPast,
} from "date-fns";
import { UserProfile } from "@/features/profile/api";
import { User } from "@/features/auth/hooks/useAuth";
import { CountdownUnits, TargetExamInfo, Wallpaper } from "../types";
import { getDailyWallpaper } from "../constants/wallpapers";

export function useTargetCountdown(user?: UserProfile | User | null) {
    const [now, setNow] = useState<Date>(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const activeTarget: TargetExamInfo | null = useMemo(() => {
        if (user?.target_exam_date && (user?.target_exam_name || user?.target_exam)) {
            const parsed = parseISO(user.target_exam_date);
            if (isValid(parsed)) {
                return {
                    category: user.target_exam || "Other",
                    name: user.target_exam_name || user.target_exam || "",
                    date: parsed,
                    dateStr: user.target_exam_date.split("T")[0],
                };
            }
        }

        if (typeof window !== "undefined") {
            const savedDate = localStorage.getItem("prepniti_target_exam_date");
            const savedLabel = localStorage.getItem("prepniti_target_exam_label");
            if (savedDate && savedLabel) {
                const parsed = parseISO(savedDate);
                if (isValid(parsed)) {
                    return {
                        category: "Other",
                        name: savedLabel,
                        date: parsed,
                        dateStr: savedDate,
                    };
                }
            }
        }

        return null;
    }, [user]);

    const daysRemaining: number | null = useMemo(() => {
        if (!activeTarget || !isValid(activeTarget.date)) return null;
        const start = startOfDay(activeTarget.date);
        const curr = startOfDay(now);
        if (isPast(start) && start.getTime() !== curr.getTime()) return 0;
        return Math.max(0, differenceInDays(start, curr));
    }, [activeTarget, now]);

    const units: CountdownUnits = useMemo(() => {
        if (!activeTarget || !isValid(activeTarget.date)) {
            return { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isDDay: false };
        }

        const target = activeTarget.date;
        if (isPast(target) && differenceInSeconds(target, now) <= 0) {
            return { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isDDay: true };
        }

        const totalMonths = Math.max(0, differenceInMonths(target, now));
        const afterMonths = addMonths(now, totalMonths);
        const days = Math.max(0, differenceInDays(target, afterMonths));
        
        const totalHours = Math.max(0, differenceInHours(target, now));
        const hours = totalHours % 24;

        const totalMinutes = Math.max(0, differenceInMinutes(target, now));
        const minutes = totalMinutes % 60;

        const totalSeconds = Math.max(0, differenceInSeconds(target, now));
        const seconds = totalSeconds % 60;

        return {
            months: totalMonths,
            days,
            hours,
            minutes,
            seconds,
            isDDay: false,
        };
    }, [activeTarget, now]);

    const wallpaper: Wallpaper = useMemo(() => {
        return getDailyWallpaper(now);
    }, [now]);

    return {
        now,
        activeTarget,
        daysRemaining,
        units,
        wallpaper,
        isConfigured: Boolean(activeTarget),
    };
}
