"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import Link from "next/link";
import { AuthLayout } from "@/features/auth/components/AuthLayout";

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";

    if (!token) {
        return (
            <div className="text-center space-y-3 py-2">
                <p className="text-sm text-destructive font-semibold">
                    Error: Missing or invalid password reset token.
                </p>
                <Link href="/forgot-password" className="inline-block text-xs font-bold text-primary hover:underline underline-offset-4">
                    Request a new reset link
                </Link>
            </div>
        );
    }

    return <ResetPasswordForm token={token} />;
}

export default function ResetPasswordPage() {
    return (
        <AuthLayout
            sidebarTitle={
                <>
                    Update Your <br />
                    Password.
                </>
            }
            sidebarBody="Create a strong, unique password to secure your account. Once updated, you can log in immediately with your new credentials."
            pageTitle="Update password"
            pageSubtitle="Create a secure password containing numbers and symbols."
            footer={
                <>
                    Back to{" "}
                    <Link href="/login" className="font-bold text-primary hover:underline underline-offset-4">
                        Log in
                    </Link>
                </>
            }
        >
            <Suspense fallback={<div className="text-center py-4 text-xs text-muted-foreground">Extracting security credentials...</div>}>
                <ResetPasswordContent />
            </Suspense>
        </AuthLayout>
    );
}
