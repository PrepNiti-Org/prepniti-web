"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForgotPasswordMutation } from "../hooks/useForgotPasswordMutation";
import { forgotPasswordSchema, ForgotPasswordInput } from "../schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail, Loader2 } from "lucide-react";

export function ForgotPasswordForm() {
	const form = useForm<ForgotPasswordInput>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: { email: "" },
	});

	const mutation = useForgotPasswordMutation(form.reset);

	function onSubmit(values: ForgotPasswordInput) {
		mutation.mutate(values);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
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

				<Button 
					type="submit" 
					className="w-full font-bold h-10 rounded-xl bg-gradient-to-r from-primary to-orange-600 hover:from-primary/95 hover:to-orange-600/95 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] mt-2 text-xs sm:text-sm text-white shadow-md hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer" 
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
