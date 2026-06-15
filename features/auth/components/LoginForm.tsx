"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { AxiosError } from "axios";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

const formSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export function LoginForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "", password: "" },
    });

    const mutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            Cookies.set("token", data.token, {
                expires: 7,
                secure: window.location.protocol === 'https:'
            });
            localStorage.setItem("user", JSON.stringify(data.user));
            toast.success("Welcome back!", {
                description: `Hello, ${data.user.username}!`,
            });
            window.location.href = "/";
        },
        onError: (error: AxiosError<{ error: string }>) => {
            toast.error("Login Failed", {
                description: error.response?.data?.error || error.message || "Something went wrong",
            });
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        mutation.mutate(values);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                    name="password"
                    render={({ field }) => (
                        <FormItem className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Password</FormLabel>
                            </div>
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
                            Signing in...
                        </span>
                    ) : (
                        "Sign In"
                    )}
                </Button>
            </form>
        </Form>
    );
}