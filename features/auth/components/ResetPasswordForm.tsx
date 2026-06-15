"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResetPasswordMutation } from "../hooks/useResetPasswordMutation";
import { resetPasswordSchema, ResetPasswordInput } from "../schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ResetPasswordForm({ token }: { token: string }) {
	const form = useForm<ResetPasswordInput>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: { new_password: "" },
	});

	const password = form.watch("new_password") || "";

	const mutation = useResetPasswordMutation();

	function onSubmit(values: ResetPasswordInput) {
		mutation.mutate({
			token,
			new_password: values.new_password,
		});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
				<FormField
					control={form.control}
					name="new_password"
					render={({ field }) => (
						<FormItem className="space-y-1.5">
							<FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">New Password</FormLabel>
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
