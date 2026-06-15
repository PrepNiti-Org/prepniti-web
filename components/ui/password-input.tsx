import * as React from "react"
import { Input } from "@/components/ui/input"
import { Lock, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PasswordInputProps extends React.ComponentProps<typeof Input> {}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    return (
      <div className="relative flex items-center w-full">
        <Lock className="absolute left-3.5 text-muted-foreground/75 h-4 w-4 pointer-events-none" />
        <Input
          type={showPassword ? "text" : "password"}
          className={cn(
            "pl-10 pr-10 bg-background/40 border-border/60 focus-visible:ring-primary/20 h-10 transition-all rounded-xl",
            className
          )}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3.5 text-muted-foreground/75 hover:text-foreground transition-colors focus:outline-none"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    )
  }
)

PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
