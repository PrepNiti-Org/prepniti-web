"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginMutation } from "../hooks/useLoginMutation";
import { loginSchema, LoginInput } from "../schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Link from "next/link";
import { Mail, Loader2 } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ?? "http://localhost:8080";

function GoogleIcon() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
			<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
			<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
			<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
			<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
		</svg>
	);
}

export function LoginForm() {
	const form = useForm<LoginInput>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: "", password: "" },
	});

	const mutation = useLoginMutation();

	function onSubmit(values: LoginInput) {
		mutation.mutate(values);
	}

	return (
		<div className="space-y-4">
			{/* Google SSO Button */}
			<a
				href={`${BACKEND_URL}/api/auth/google`}
				id="google-sso-login-btn"
				className="flex items-center justify-center gap-2.5 w-full h-10 rounded-xl border border-border/60 bg-background/40 hover:bg-background/70 transition-all duration-200 text-sm font-semibold text-foreground hover:shadow-md active:scale-[0.98]"
			>
				<GoogleIcon />
				Continue with Google
			</a>

			{/* Divider */}
			<div className="relative flex items-center gap-3">
				<div className="flex-1 h-px bg-border/50" />
				<span className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest">or</span>
				<div className="flex-1 h-px bg-border/50" />
			</div>

			{/* Email / Password Form */}
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
									<Link 
										href="/forgot-password" 
										className="text-[10px] font-bold text-primary hover:underline underline-offset-4"
									>
										Forgot password?
									</Link>
								</div>
								<FormControl>
									<PasswordInput {...field} />
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
		</div>
	);
}