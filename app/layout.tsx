import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/lib/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PrepNiti",
  description: "Anonymous Community for Aspirants",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>

        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>

            <div className="fixed inset-0 -z-50 h-full w-full bg-background">
              <div className="absolute inset-0 bg-dot-pattern opacity-50"></div>
            </div>

            <Navbar />
            <main className="container relative mx-auto py-8 min-h-screen">
              {children}
            </main>
            <Toaster />

          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}