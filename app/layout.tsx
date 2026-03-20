import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { siteConfig } from "@/lib/site-config";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["500", "600", "700"],
  display: "swap"
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DM Public School",
    template: "%s | DM Public School"
  },
  description: siteConfig.description,
  openGraph: {
    title: "DM Public School",
    description: siteConfig.description,
    url: siteUrl,
    siteName: "DM Public School",
    locale: "en_IN",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "DM Public School",
    description: siteConfig.description
  },
  keywords: [
    "DM Public School",
    "School Website",
    "Admissions",
    "Academic Events",
    "Notice Board"
  ]
};

export const viewport: Viewport = {
  themeColor: "#2f79f7",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
