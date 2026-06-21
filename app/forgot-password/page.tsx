"use client";

import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import Link from "next/link";
import { AuthLayout } from "@/features/auth/components/AuthLayout";

export default function ForgotPasswordPage() {
    return (
        <AuthLayout
            sidebarTitle={
                <>
                    Recover Your <br />
                    Account.
                </>
            }
            sidebarBody="No worries, it happens. Enter your registered email address and we will send you a recovery link to securely reset your password."
            pageTitle="Reset password"
            pageSubtitle="Enter your email to receive a password reset link."
            footer={
                <>
                    Remember your password?{" "}
                    <Link href="/login" className="font-bold text-primary hover:underline underline-offset-4">
                        Log in
                    </Link>
                </>
            }
        >
            <ForgotPasswordForm />
        </AuthLayout>
    );
}
