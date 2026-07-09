"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResetPasswordMutation } from "../hooks/useResetPasswordMutation";
import { resetPasswordSchema, ResetPasswordInput } from "../schemas";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";

export function ResetPasswordForm({ token }: { token: string }) {
	const form = useForm<ResetPasswordInput>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: { new_password: "" },
	});

	const password = form.watch("new_password") || "";

	const mutation = useResetPasswordMutation();
	const [passwordFocused, setPasswordFocused] = useState(false);

	function onSubmit(values: ResetPasswordInput) {
		mutation.mutate({
			token,
			new_password: values.new_password,
		});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5 sm:space-y-5">
				<FormField
					control={form.control}
					name="new_password"
					render={({ field }) => (
						<FormItem className="space-y-1">
							<FormLabel className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">New Password</FormLabel>
							<TooltipProvider delayDuration={0}>
								<Tooltip open={passwordFocused}>
									<TooltipTrigger asChild>
										<FormControl>
											<PasswordInput 
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
					className="w-full font-bold h-9 sm:h-10 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] mt-1 sm:mt-2 text-xs sm:text-sm"
					disabled={mutation.isPending}
				>
					{mutation.isPending ? (
						<span className="flex items-center justify-center gap-2">
							<Loader2 className="h-4 w-4 animate-spin" />
							Resetting...
						</span>
					) : (
						"Reset Password"
					)}
				</Button>
			</form>
		</Form>
	);
}
