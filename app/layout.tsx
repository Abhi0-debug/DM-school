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

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/+$/,
  ""
);
const homeTitle = "D.M. Public School Puri | Admissions Open 2026";
const ogImagePath = "/images/New Building.jpeg";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: homeTitle,
    template: "%s | D.M. Public School Puri"
  },
  applicationName: "D.M. Public School Puri",
  alternates: {
    canonical: "/"
  },
  icons: {
    icon: "/CICA LOGO 3.png",
    shortcut: "/CICA LOGO 3.png",
    apple: "/CICA LOGO 3.png"
  },
  description: siteConfig.description,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  openGraph: {
    title: homeTitle,
    description: siteConfig.description,
    url: "/",
    siteName: "DM Public School Puri",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: ogImagePath,
        width: 1200,
        height: 630,
        alt: "DM Public School Puri campus building"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: homeTitle,
    description: siteConfig.description,
    images: [ogImagePath]
  },
  keywords: [
    "DM Public School Puri",
    "School in Puri Odisha",
    "Admissions Open 2026",
    "Best school in Puri",
    "CBSE school in Puri",
    "DM Public School admissions"
  ],
  category: "education",
  other: {
    "geo.region": "IN-OR",
    "geo.placename": "Puri, Odisha"
  }
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
