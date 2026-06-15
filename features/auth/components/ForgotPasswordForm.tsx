"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "../api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Mail, Loader2 } from "lucide-react";

const formSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export function ForgotPasswordForm() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "" },
    });

    const mutation = useMutation({
        mutationFn: forgotPassword,
        onSuccess: (data) => {
            toast.success("Request Successful", {
                description: data.message || "A reset link has been dispatched.",
            });
            form.reset();
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.error || error.message || "Something went wrong";
            toast.error("Request Failed", {
                description: msg,
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

                <Button 
                    type="submit" 
                    className="w-full font-bold h-10 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] mt-2" 
                    disabled={mutation.isPending}
                >
                    {mutation.isPending ? (
                        <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending link...
                        </span>
                    ) : (
                        "Send Reset Link"
                    )}
                </Button>
            </form>
        </Form>
    );
}
