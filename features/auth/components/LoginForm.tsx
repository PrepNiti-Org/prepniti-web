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
	);
}