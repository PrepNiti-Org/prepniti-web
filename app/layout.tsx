import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/lib/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme/theme-provider";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PrepNiti",
  description: "Anonymous Community for Aspirants",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.className} antialiased`}>

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

            <AppShell>
              {children}
            </AppShell>

            <Toaster />

          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}