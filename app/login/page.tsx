"use client";

import { LoginForm } from "@/features/auth/components/LoginForm";
import Link from "next/link";
import { AuthLayout } from "@/features/auth/components/AuthLayout";

export default function LoginPage() {
    return (
        <AuthLayout
            sidebarTitle={
                <>
                    Assemble, Practice, <br />
                    and Succeed.
                </>
            }
            sidebarBody="PrepNiti is an anonymous, high-performance community built for competitive exam aspirants. Track study logs, practice full-length mocks, and benchmark your progress without compromising identity."
            pageTitle="Welcome back"
            pageSubtitle="Enter your credentials to access your dashboard."
            footer={
                <>
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="font-bold text-primary hover:underline underline-offset-4">
                        Sign up for free
                    </Link>
                </>
            }
        >
            <LoginForm />
        </AuthLayout>
    );
}