import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leetalysis.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Leetalysis — LeetCode Profile Analytics & Progress Tracker",
    template: "%s | Leetalysis",
  },
  description:
    "Analyze any LeetCode profile instantly. View topic strength, difficulty distribution, submission history, class roster progression, and competitive coding metrics with deep visual insights.",
  keywords: [
    "LeetCode",
    "LeetCode Analytics",
    "LeetCode Profile Analyzer",
    "LeetCode Tracker",
    "LeetCode Stats",
    "Coding Practice Analyzer",
    "LeetCode Progress Tracker",
    "LeetCode Contest Rating",
    "Algorithm Practice Analytics",
    "Developer Portfolio Analytics",
    "Leetalysis",
    "LeetCode Class Roster",
    "LeetCode Submissions",
  ],
  authors: [{ name: "Ajay Thakur", url: "https://github.com/theajthakur" }],
  creator: "Ajay Thakur",
  publisher: "Leetalysis",
  applicationName: "Leetalysis",
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "Leetalysis — Instant LeetCode Profile Analytics",
    description:
      "Get deep visual insights, topic-wise metrics, and detailed submission progression analysis of any LeetCode user profile instantly.",
    siteName: "Leetalysis",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Leetalysis - LeetCode Profile Analytics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Leetalysis — Instant LeetCode Profile Analytics",
    description:
      "Get deep visual insights, topic-wise metrics, and detailed progression analysis of any LeetCode profile instantly.",
    images: ["/logo.png"],
    creator: "@theajthakur",
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
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Leetalysis",
  alternateName: "LeetCode Profile Analytics",
  url: siteUrl,
  description:
    "Analyze any LeetCode profile instantly. View topic strength, difficulty stats, submission history, class roster progression, and competitive coding metrics.",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "All",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Person",
    name: "Ajay Thakur",
    url: "https://github.com/theajthakur",
  },
  featureList: [
    "LeetCode Profile Lookup",
    "Class Roster Analytics",
    "Topic-wise Metric Visualization",
    "Submission History Tracking",
    "Problem Difficulty Breakdown",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <NuqsAdapter>{children}</NuqsAdapter>
        <Analytics />
      </body>
    </html>
  );
}


