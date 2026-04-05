"use client";

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
import axios, { AxiosError } from "axios";

const formSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export function LoginForm() {
    const router = useRouter();

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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><Input placeholder="aspirant@example.com" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl><Input type="password" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                    {mutation.isPending ? "Logging in..." : "Login"}
                </Button>
            </form>
        </Form>
    );
}