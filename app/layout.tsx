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
const faviconVersion = "20260411.2";
const defaultTitle = "D.M Public School, Puri";
const homeTitle = `${defaultTitle} | Admissions Open 2026`;
const ogImagePath = "/images/New Building.jpeg";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | D.M Public School, Puri"
  },
  applicationName: defaultTitle,
  manifest: `/site.webmanifest?v=${faviconVersion}`,
  formatDetection: {
    telephone: false,
    address: false,
    email: false
  },
  alternates: {
    canonical: "/"
  },
  icons: {
    icon: [
      { url: `/favicon.ico?v=${faviconVersion}`, sizes: "any", type: "image/x-icon" },
      {
        url: `/favicon-32x32.png?v=${faviconVersion}`,
        type: "image/png",
        sizes: "32x32"
      },
      {
        url: `/favicon-16x16.png?v=${faviconVersion}`,
        type: "image/png",
        sizes: "16x16"
      }
    ],
    shortcut: `/favicon.ico?v=${faviconVersion}`,
    apple: [
      {
        url: `/apple-touch-icon.png?v=${faviconVersion}`,
        type: "image/png",
        sizes: "180x180"
      }
    ]
  },
  description: siteConfig.description,
  keywords: [
    "D.M Public School, Puri",
    "DM Public School Puri",
    "School in Puri Odisha",
    "CBSE school in Puri",
    "Best school in Puri",
    "Admissions Open 2026",
    "Odisha school admissions"
  ],
  authors: [{ name: "D.M Public School" }],
  creator: "D.M Public School",
  publisher: "D.M Public School",
  robots: {
    index: true,
    follow: true,
    nocache: false,
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
    siteName: defaultTitle,
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
  category: "education",
  other: {
    "geo.region": "IN-OR",
    "geo.placename": "Puri, Odisha",
    "geo.position": "19.806225628641517;85.82680267595559"
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
    <html lang="en-IN" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100`}>
        <a
          href="#main-content"
          className="sr-only z-[100] rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm focus:not-sr-only focus:absolute focus:left-3 focus:top-3"
        >
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
