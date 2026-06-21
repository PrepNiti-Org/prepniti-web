"use client";

import { RegisterForm } from "@/features/auth/components/RegisterForm";
import Link from "next/link";
import { AuthLayout } from "@/features/auth/components/AuthLayout";

export default function RegisterPage() {
    return (
        <AuthLayout
            sidebarTitle={
                <>
                    Empowering Your <br />
                    Aspirations.
                </>
            }
            sidebarBody="Start your competitive exam preparation today. PrepNiti provides secure progress tracking, anonymous mock exams, and collaborative benchmark analytics."
            pageTitle="Create an account"
            pageSubtitle="Enter your details below to set up your prep space."
            footer={
                <>
                    Already have an account?{" "}
                    <Link href="/login" className="font-bold text-primary hover:underline underline-offset-4">
                        Log in
                    </Link>
                </>
            }
        >
            <RegisterForm />
        </AuthLayout>
    );
}