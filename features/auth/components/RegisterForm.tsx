"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegisterMutation } from "../hooks/useRegisterMutation";
import { registerSchema, RegisterInput } from "../schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Loader2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function RegisterForm() {
	const form = useForm<RegisterInput>({
		resolver: zodResolver(registerSchema),
		defaultValues: { username: "", email: "", password: "", target_exam: "" },
	});

	const password = form.watch("password") || "";

	const mutation = useRegisterMutation();

	function onSubmit(values: RegisterInput) {
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
								<PasswordInput {...field} />
							</FormControl>
							<PasswordStrengthMeter password={password} />
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