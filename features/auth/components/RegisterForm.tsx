"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, Mail, Lock, Eye, EyeOff, Loader2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 chars"),
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    target_exam: z.string().min(1, "Please select a target exam"),
});

export function RegisterForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { username: "", email: "", password: "", target_exam: "" },
    });

    const password = form.watch("password") || "";
    const hasMinLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    const strengthPoints = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

    const mutation = useMutation({
        mutationFn: registerUser,
        onSuccess: () => {
            toast.success("Account Created!", { description: "Please login with your new account." });
            router.push("/login");
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            const msg = error?.response?.data?.error || "Registration Failed";
            console.log("Registration error:", error);
            toast.error("Error", { description: msg });
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        mutation.mutate(values);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem className="space-y-1.5">
                            <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Username</FormLabel>
                            <FormControl>
                                <div className="relative flex items-center">
                                    <User className="absolute left-3.5 text-muted-foreground/75 h-4 w-4 pointer-events-none" />
                                    <Input
                                        placeholder="UPSC_Warrior"
                                        className="pl-10 bg-background/40 border-border/60 focus-visible:ring-primary/20 h-10 transition-all rounded-xl"
                                        {...field}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem className="space-y-1.5">
                            <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email</FormLabel>
                            <FormControl>
                                <div className="relative flex items-center">
                                    <Mail className="absolute left-3.5 text-muted-foreground/75 h-4 w-4 pointer-events-none" />
                                    <Input
                                        placeholder="aspirant@example.com"
                                        className="pl-10 bg-background/40 border-border/60 focus-visible:ring-primary/20 h-10 transition-all rounded-xl"
                                        {...field}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="target_exam"
                    render={({ field }) => (
                        <FormItem className="space-y-1.5">
                            <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Target Exam</FormLabel>
                            <div className="relative flex items-center">
                                <BookOpen className="absolute left-3.5 text-muted-foreground/75 h-4 w-4 pointer-events-none z-10" />
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="w-full pl-10 bg-background/40 border-border/60 focus-visible:ring-primary/20 h-10 transition-all rounded-xl text-left">
                                            <SelectValue placeholder="Select target exam" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="UPSC">UPSC</SelectItem>
                                        <SelectItem value="JEE">JEE</SelectItem>
                                        <SelectItem value="NEET">NEET</SelectItem>
                                        <SelectItem value="GATE">GATE</SelectItem>
                                        <SelectItem value="CAT">CAT</SelectItem>
                                        <SelectItem value="SSC">SSC CGL</SelectItem>
                                        <SelectItem value="Bank">Bank</SelectItem>
                                        <SelectItem value="Teaching">Teaching</SelectItem>
                                        <SelectItem value="State PCS">State PCS</SelectItem>
                                        <SelectItem value="Defence">Defence</SelectItem>
                                        <SelectItem value="Law">Law</SelectItem>
                                        <SelectItem value="Nursing">Nursing</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem className="space-y-1.5">
                            <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Password</FormLabel>
                            <FormControl>
                                <div className="relative flex items-center">
                                    <Lock className="absolute left-3.5 text-muted-foreground/75 h-4 w-4 pointer-events-none" />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        className="pl-10 pr-10 bg-background/40 border-border/60 focus-visible:ring-primary/20 h-10 transition-all rounded-xl"
                                        {...field}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 text-muted-foreground/75 hover:text-foreground transition-colors focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </FormControl>
                            {password.length > 0 && (
                                <div className="mt-3 space-y-2 text-xs">
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
                                        <span className={cn(
                                            strengthPoints <= 2 && "text-red-500",
                                            (strengthPoints === 3 || strengthPoints === 4) && "text-amber-500",
                                            strengthPoints === 5 && "text-green-500"
                                        )}>
                                            {strengthPoints <= 2 ? "Weak" : strengthPoints <= 4 ? "Medium" : "Strong"}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-1.5 border-t border-border/20">
                                        <div className="flex items-center gap-1.5 text-muted-foreground text-[10px]">
                                            <div className={cn("h-1.5 w-1.5 rounded-full shrink-0 transition-all", hasMinLength ? "bg-green-500" : "bg-muted-foreground/30")} />
                                            <span className={cn(hasMinLength && "text-foreground font-medium")}>8+ characters</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-muted-foreground text-[10px]">
                                            <div className={cn("h-1.5 w-1.5 rounded-full shrink-0 transition-all", hasUpper ? "bg-green-500" : "bg-muted-foreground/30")} />
                                            <span className={cn(hasUpper && "text-foreground font-medium")}>Uppercase letter</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-muted-foreground text-[10px]">
                                            <div className={cn("h-1.5 w-1.5 rounded-full shrink-0 transition-all", hasLower ? "bg-green-500" : "bg-muted-foreground/30")} />
                                            <span className={cn(hasLower && "text-foreground font-medium")}>Lowercase letter</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-muted-foreground text-[10px]">
                                            <div className={cn("h-1.5 w-1.5 rounded-full shrink-0 transition-all", hasNumber ? "bg-green-500" : "bg-muted-foreground/30")} />
                                            <span className={cn(hasNumber && "text-foreground font-medium")}>At least 1 number</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] col-span-2">
                                            <div className={cn("h-1.5 w-1.5 rounded-full shrink-0 transition-all", hasSpecial ? "bg-green-500" : "bg-muted-foreground/30")} />
                                            <span className={cn(hasSpecial && "text-foreground font-medium")}>Special symbol (e.g. @, $, !, %)</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className="w-full font-bold h-10 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] mt-2"
                    disabled={mutation.isPending}
                >
                    {mutation.isPending ? (
                        <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Creating Account...
                        </span>
                    ) : (
                        "Register"
                    )}
                </Button>
            </form>
        </Form>
    );
}