import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LiquidBackground from "@/components/animations/LiquidBackground";
import ScrollRevealInit from "@/components/animations/ScrollRevealInit";
import SiteWrapper from "@/components/animations/SiteWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ThunderCipher Conference 2026 — Shaping the Future of Cyber Defense",
  description: "Join us at Sharda University on 3rd - 4th October 2026 for ThunderCipher, the premier annual cybersecurity conference featuring training, keynotes, interactive villages, and competitive CTF challenges.",
  metadataBase: new URL("https://tcconf2026.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ThunderCipher Conference 2026 — Shaping the Future of Cyber Defense",
    description: "An elite annual cybersecurity conference at Sharda University featuring keynotes, Hacking Villages, and Capture the Flag.",
    url: "https://tcconf2026.vercel.app",
    siteName: "ThunderCipher 2026",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ThunderCipher Conference 2026",
    description: "Shaping the Future of Cyber Defense. Join us at Sharda University on 3rd - 4th October 2026.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Event schema JSON-LD
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "ThunderCipher Conference 2026",
    "startDate": "2026-10-03T09:00:00+05:30",
    "endDate": "2026-10-04T18:00:00+05:30",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "eventStatus": "https://schema.org/EventScheduled",
    "location": {
      "@type": "Place",
      "name": "Sharda University",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Plot No. 32-34, Knowledge Park III",
        "addressLocality": "Greater Noida",
        "addressRegion": "Uttar Pradesh",
        "postalCode": "201310",
        "addressCountry": "IN"
      }
    },
    "description": "Shaping the Future of Cyber Defense. An elite annual cybersecurity conference featuring hacking training, keynotes, lockpicking villages, and Capture the Flag (CTF).",
    "organizer": {
      "@type": "Organization",
      "name": "ThunderCipher Committee",
      "url": "https://tcconf2026.vercel.app"
    }
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col relative text-slate-100 bg-[#030303] selection:bg-thunder-blue/30 selection:text-white">
        {/* Scroll Reveal & Letter Stagger Client Initializer */}
        <ScrollRevealInit />

        {/* Dynamic Shader Liquid Background Canvas */}
        <LiquidBackground />
        
        {/* Static Noise Overlay */}
        <div className="noise-bg" />

        {/* Site Wrapper handles cinematic intro sequencing and main layout fade-in */}
        <SiteWrapper navbar={<Navbar />} footer={<Footer />}>
          {children}
        </SiteWrapper>
      </body>
    </html>
  );
}
