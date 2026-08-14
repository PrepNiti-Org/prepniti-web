import * as React from "react"
import { cn } from "@/lib/utils"

interface PasswordStrengthMeterProps {
  password?: string
}

export function PasswordStrengthMeter({ password = "" }: PasswordStrengthMeterProps) {
  const hasMinLength = password.length >= 8
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)

  const strengthPoints = [
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
  ].filter(Boolean).length

  return (
    <div className="space-y-2 text-xs">
      <div className="flex gap-1 h-1 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            strengthPoints === 1 && "w-1/5 bg-red-500",
            strengthPoints === 2 && "w-2/5 bg-red-400",
            strengthPoints === 3 && "w-3/5 bg-amber-500",
            strengthPoints === 4 && "w-4/5 bg-blue-500",
            strengthPoints === 5 && "w-full bg-green-500"
          )}
        />
      </div>
      <div className="flex justify-between items-center text-[10px] font-bold tracking-wide uppercase">
        <span className="text-muted-foreground">Strength:</span>
        <span
          className={cn(
            strengthPoints <= 2 && "text-red-500",
            (strengthPoints === 3 || strengthPoints === 4) && "text-amber-500",
            strengthPoints === 5 && "text-green-500"
          )}
        >
          {strengthPoints === 0 ? "Too Short" : strengthPoints <= 2 ? "Weak" : strengthPoints <= 4 ? "Medium" : "Strong"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-1.5 border-t border-border/20">
        <div className="flex items-center gap-1.5 text-muted-foreground text-[10px]">
          <div
            className={cn(
              "h-1.5 w-1.5 rounded-full shrink-0 transition-all",
              hasMinLength ? "bg-green-500" : "bg-muted-foreground/30"
            )}
          />
          <span className={cn(hasMinLength && "text-foreground font-medium")}>
            8+ characters
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground text-[10px]">
          <div
            className={cn(
              "h-1.5 w-1.5 rounded-full shrink-0 transition-all",
              hasUpper ? "bg-green-500" : "bg-muted-foreground/30"
            )}
          />
          <span className={cn(hasUpper && "text-foreground font-medium")}>
            Uppercase letter
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground text-[10px]">
          <div
            className={cn(
              "h-1.5 w-1.5 rounded-full shrink-0 transition-all",
              hasLower ? "bg-green-500" : "bg-muted-foreground/30"
            )}
          />
          <span className={cn(hasLower && "text-foreground font-medium")}>
            Lowercase letter
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground text-[10px]">
          <div
            className={cn(
              "h-1.5 w-1.5 rounded-full shrink-0 transition-all",
              hasNumber ? "bg-green-500" : "bg-muted-foreground/30"
            )}
          />
          <span className={cn(hasNumber && "text-foreground font-medium")}>
            At least 1 number
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] col-span-2">
          <div
            className={cn(
              "h-1.5 w-1.5 rounded-full shrink-0 transition-all",
              hasSpecial ? "bg-green-500" : "bg-muted-foreground/30"
            )}
          />
          <span className={cn(hasSpecial && "text-foreground font-medium")}>
            Special symbol (e.g. @, $, !, %)
          </span>
        </div>
      </div>
    </div>
  )
}
