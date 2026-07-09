import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Lock, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

export type PasswordInputProps = React.ComponentProps<typeof Input>;

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    return (
      <div className="relative flex items-center w-full">
        <Lock className="absolute left-3 sm:left-3.5 text-muted-foreground/75 h-3.5 w-3.5 sm:h-4 w-4 pointer-events-none" />
        <Input
          type={showPassword ? "text" : "password"}
          className={cn(
            "pl-8 pr-8 sm:pl-10 sm:pr-10 bg-background/40 border-border/60 focus-visible:ring-primary/20 h-9 sm:h-10 text-xs sm:text-sm transition-all rounded-xl",
            className
          )}
          ref={ref}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-1.5 sm:right-2 h-6 w-6 sm:h-7 w-7 text-muted-foreground/75 hover:text-foreground"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-3.5 w-3.5 sm:h-4 w-4" />
          ) : (
            <Eye className="h-3.5 w-3.5 sm:h-4 w-4" />
          )}
        </Button>
      </div>
    )
  }
)

PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
