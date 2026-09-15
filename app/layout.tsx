import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://inject3r.github.io/atomhttp"),
  title: {
    default: "AtomHTTP - Sync-First HTTP Client for Python",
    template: "%s | AtomHTTP",
  },
  description:
    "AtomHTTP is a synchronous-first HTTP client for Python with fully optional async support, built entirely on urllib3. Features cancellation, multithreading, streaming uploads/downloads, caching, interceptors, and full type hints.",
  keywords: [
    "python http client",
    "async http client",
    "python requests alternative",
    "http client library",
    "python rest api client",
    "async await http",
    "python httpx alternative",
    "http interceptors python",
    "file upload python",
    "progress tracking python",
    "type hints http client",
  ],
  authors: [{ name: "Abolfazl Hosseini", url: "https://github.com/inject3r" }],
  creator: "Abolfazl Hosseini",
  publisher: "AtomHTTP",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
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
  openGraph: {
    title: "AtomHTTP - Sync-First HTTP Client for Python",
    description:
      "Sync by default, async optional. Built on urllib3, with cancellation, multithreading, streaming, and caching built in.",
    url: "https://inject3r.github.io/atomhttp",
    siteName: "AtomHTTP",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AtomHTTP - Sync-First HTTP Client for Python",
    description:
      "Sync by default, async optional. Built on urllib3, with cancellation, multithreading, streaming, and caching built in.",
    creator: "@inject3r",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: { url: "/apple-icon.png", sizes: "180x180" },
  },
  manifest: "/manifest.json",
  category: "technology",
  classification: "Software Development",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-black text-gray-200`}
      >
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
