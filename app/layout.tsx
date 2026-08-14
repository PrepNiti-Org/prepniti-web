import type { Metadata } from "next";
import { Outfit, Caveat } from "next/font/google";
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

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-handwritten",
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://prepniti.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "PrepNiti - Anonymous Community & Prep Platform for Aspirants",
    template: "%s | PrepNiti",
  },
  description:
    "PrepNiti is India's anonymous peer community and intelligent preparation platform for UPSC, SSC, Banking, State PCS, and competitive exam aspirants. Track study sessions, take mock tests, and learn with peers.",
  applicationName: "PrepNiti",
  authors: [{ name: "PrepNiti Team", url: baseUrl }],
  generator: "Next.js",
  keywords: [
    "PrepNiti",
    "UPSC preparation",
    "SSC CGL mock tests",
    "Study tracker India",
    "Competitive exams community",
    "Anonymous aspirant discussions",
    "Pomodoro study timer",
    "State PCS syllabus tracker",
    "Study buddy finder",
    "UPSC CSE peer network",
    "Mock test CBT simulator",
  ],
  creator: "PrepNiti",
  publisher: "PrepNiti",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: baseUrl,
    siteName: "PrepNiti",
    title: "PrepNiti - Anonymous Community & Prep Platform for Aspirants",
    description:
      "Connect anonymously with serious aspirants, track syllabus progress, take realistic mock tests, and get deep preparation insights.",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        secureUrl: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "PrepNiti - Aspirant Preparation & Community Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PrepNiti - Anonymous Community & Prep Platform for Aspirants",
    description:
      "Connect anonymously with serious aspirants, track syllabus progress, take realistic mock tests, and get deep preparation insights.",
    images: [`${baseUrl}/og-image.png`],
    creator: "@PrepNiti",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
  ...(process.env.NEXT_PUBLIC_FB_APP_ID
    ? {
        facebook: {
          appId: process.env.NEXT_PUBLIC_FB_APP_ID,
        },
      }
    : {}),
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      "url": baseUrl,
      "name": "PrepNiti",
      "description": "Anonymous Peer Community and Preparation Intelligence Platform for Competitive Exam Aspirants",
      "publisher": {
        "@id": `${baseUrl}/#organization`
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${baseUrl}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      },
      "inLanguage": "en-US"
    },
    {
      "@type": "EducationalOrganization",
      "@id": `${baseUrl}/#organization`,
      "name": "PrepNiti",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "@id": `${baseUrl}/#logo`,
        "inLanguage": "en-US",
        "url": `${baseUrl}/icon-512.png`,
        "contentUrl": `${baseUrl}/icon-512.png`,
        "width": 512,
        "height": 512,
        "caption": "PrepNiti Logo"
      },
      "image": {
        "@id": `${baseUrl}/#logo`
      },
      "description": "PrepNiti is an online educational community and preparation ecosystem for UPSC, SSC, Banking, and State PSC aspirants.",
      "sameAs": [
        "https://twitter.com/PrepNiti",
        "https://github.com/PrepNiti-Org"
      ]
    },
    {
      "@type": "WebApplication",
      "@id": `${baseUrl}/#webapp`,
      "url": baseUrl,
      "name": "PrepNiti Web Application",
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires JavaScript. Requires HTML5.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR"
      },
      "featureList": [
        "Anonymous Aspirant Discussions & Strategy Sharing",
        "Kanban Syllabus Tracker with Revision & Reading Categories",
        "Active Study Pomodoro Timer with Streak Tracking",
        "Timed CBT Mock Test Workspace with Detailed Solutions",
        "Preparation Radar Analytics & Revision Insights",
        "Location & Target Exam Study Buddy Discovery"
      ]
    }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${outfit.className} ${caveat.variable} antialiased`}>

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