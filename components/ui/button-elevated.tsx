import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ElevatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "accent" | "ghost" | "destructive";
    size?: "sm" | "default" | "lg";
    iconOnly?: boolean;
}

export const ElevatedButton = forwardRef<HTMLButtonElement, ElevatedButtonProps>(
    ({ className, variant = "primary", size = "default", iconOnly, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    // base
                    "relative inline-flex items-center justify-center gap-[7px]",
                    "font-medium tracking-[0.01em] border-none cursor-pointer select-none",
                    "transition-all duration-100 outline-none",
                    "active:translate-y-[3px]",
                    "hover:-translate-y-px hover:brightness-[1.06]",
                    "disabled:opacity-45 disabled:cursor-not-allowed disabled:translate-y-0 disabled:brightness-100",

                    // elevation via box-shadow on ::after — use inline style trick
                    "after:absolute after:inset-0 after:rounded-[inherit]",
                    "after:transition-shadow after:duration-100",

                    // sizes
                    {
                        "h-8 px-[14px] text-[12.5px] rounded-lg gap-[5px]": size === "sm",
                        "h-10 px-5 text-sm rounded-[10px]": size === "default",
                        "h-12 px-7 text-[15px] rounded-xl": size === "lg",
                        "!px-0 w-8": iconOnly && size === "sm",
                        "!px-0 w-10": iconOnly && size === "default",
                        "!px-0 w-12": iconOnly && size === "lg",
                    },

                    // variants
                    {
                        "bg-primary text-primary-foreground [--shadow:hsl(15_100%_38%)]": variant === "primary",
                        "bg-secondary text-secondary-foreground [--shadow:hsl(122_39%_30%)]": variant === "secondary",
                        "bg-accent text-accent-foreground [--shadow:hsl(160_51%_8%)]": variant === "accent",
                        "bg-muted text-foreground [--shadow:hsl(210_20%_76%)]": variant === "ghost",
                        "bg-destructive text-destructive-foreground [--shadow:hsl(0_84%_38%)]": variant === "destructive",
                    },

                    className
                )}
                style={{
                    // The 3D bottom edge
                    ["--btn-shadow" as string]: "var(--shadow)",
                }}
                {...props}
            >
                {children}
            </button>
        );
    }
);

ElevatedButton.displayName = "ElevatedButton";