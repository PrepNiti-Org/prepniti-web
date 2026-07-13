"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegisterMutation } from "../hooks/useRegisterMutation";
import { registerSchema, RegisterInput } from "../schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Loader2, BookOpen } from "lucide-react";

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

export function RegisterForm() {
	const form = useForm<RegisterInput>({
		resolver: zodResolver(registerSchema),
		defaultValues: { username: "", email: "", password: "", target_exam: "" },
	});

	const password = form.watch("password") || "";

	const mutation = useRegisterMutation();
	const [passwordFocused, setPasswordFocused] = useState(false);

	function onSubmit(values: RegisterInput) {
		mutation.mutate(values);
	}

	return (
		<div className="space-y-4">
			{/* Google SSO Button */}
			<a
				href={`${BACKEND_URL}/api/auth/google`}
				id="google-sso-register-btn"
				className="flex items-center justify-center gap-2.5 w-full h-10 rounded-xl border border-border/50 bg-background/40 hover:bg-background/80 hover:border-primary/30 transition-all duration-300 text-xs sm:text-sm font-semibold text-foreground hover:shadow-md active:scale-[0.98] cursor-pointer"
			>
				<GoogleIcon />
				Continue with Google
			</a>

			{/* Divider */}
			<div className="relative flex items-center gap-3">
				<div className="flex-1 h-px bg-border/50" />
				<span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">or</span>
				<div className="flex-1 h-px bg-border/50" />
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5 sm:space-y-4.5">
				<div className="grid grid-cols-2 gap-3">
					<FormField
						control={form.control}
						name="username"
						render={({ field }) => (
							<FormItem className="space-y-1">
								<FormLabel className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">Username</FormLabel>
								<FormControl>
									<div className="relative flex items-center">
										<User className="absolute left-3 sm:left-3.5 text-muted-foreground/75 h-3.5 w-3.5 sm:h-4 w-4 pointer-events-none" />
										<Input
											placeholder="UPSC_Warrior"
											className="pl-8 sm:pl-10 bg-background/30 border-border/50 focus-visible:ring-primary/10 focus-visible:border-primary/50 h-10 text-xs sm:text-sm transition-all duration-300 rounded-xl focus:shadow-[0_0_12px_rgba(255,87,34,0.05)]"
											{...field}
										/>
									</div>
								</FormControl>
								<FormMessage className="text-[10px]" />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="target_exam"
						render={({ field }) => (
							<FormItem className="space-y-1">
								<FormLabel className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">Target Exam</FormLabel>
								<div className="relative flex items-center">
									<BookOpen className="absolute left-3 sm:left-3.5 text-muted-foreground/75 h-3.5 w-3.5 sm:h-4 w-4 pointer-events-none z-10" />
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger className="w-full pl-8 sm:pl-10 bg-background/30 border-border/50 focus-visible:ring-primary/10 focus-visible:border-primary/50 h-10 text-xs sm:text-sm transition-all duration-300 rounded-xl text-left focus:shadow-[0_0_12px_rgba(255,87,34,0.05)]">
												<SelectValue placeholder="Select..." />
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
								<FormMessage className="text-[10px]" />
							</FormItem>
						)}
					/>
				</div>

				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem className="space-y-1">
							<FormLabel className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">Email</FormLabel>
							<FormControl>
								<div className="relative flex items-center">
									<Mail className="absolute left-3 sm:left-3.5 text-muted-foreground/75 h-3.5 w-3.5 sm:h-4 w-4 pointer-events-none" />
									<Input
										placeholder="aspirant@example.com"
										className="pl-8 sm:pl-10 bg-background/30 border-border/50 focus-visible:ring-primary/10 focus-visible:border-primary/50 h-10 text-xs sm:text-sm transition-all duration-300 rounded-xl focus:shadow-[0_0_12px_rgba(255,87,34,0.05)]"
										{...field}
									/>
								</div>
							</FormControl>
							<FormMessage className="text-[10px]" />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem className="space-y-1">
							<FormLabel className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">Password</FormLabel>
							<TooltipProvider delayDuration={0}>
								<Tooltip open={passwordFocused}>
									<TooltipTrigger asChild>
										<FormControl>
											<PasswordInput 
												className="bg-background/30 border-border/50 focus-visible:ring-primary/10 focus-visible:border-primary/50 h-10 text-xs sm:text-sm transition-all duration-300 rounded-xl focus:shadow-[0_0_12px_rgba(255,87,34,0.05)]"
												{...field} 
												onFocus={() => setPasswordFocused(true)}
												onBlur={() => {
													field.onBlur();
													setPasswordFocused(false);
												}}
											/>
										</FormControl>
									</TooltipTrigger>
									<TooltipContent 
										side="top" 
										align="center" 
										className="w-[280px] p-3.5 bg-card/95 backdrop-blur-md border border-border/80 shadow-2xl rounded-2xl"
									>
										<PasswordStrengthMeter password={password} />
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
							<FormMessage className="text-[10px]" />
						</FormItem>
					)}
				/>

				<Button
					type="submit"
					className="w-full font-bold h-10 rounded-xl bg-gradient-to-r from-primary to-orange-600 hover:from-primary/95 hover:to-orange-600/95 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] mt-2 text-xs sm:text-sm text-white shadow-md hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer"
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
		</div>
	);
}