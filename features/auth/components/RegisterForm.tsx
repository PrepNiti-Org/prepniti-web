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

const formSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 chars"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 chars"),
    target_exam: z.string().min(1, "Please select a target exam"),
});

export function RegisterForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { username: "", email: "", password: "", target_exam: "" },
    });

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