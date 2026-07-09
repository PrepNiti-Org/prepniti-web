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
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5 sm:space-y-5">
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
										className="pl-8 sm:pl-10 bg-background/40 border-border/60 focus-visible:ring-primary/20 h-9 sm:h-10 text-xs sm:text-sm transition-all rounded-xl"
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
					className="w-full font-bold h-9 sm:h-10 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] mt-1 sm:mt-2 text-xs sm:text-sm" 
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
