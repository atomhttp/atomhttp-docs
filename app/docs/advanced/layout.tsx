import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advanced Features",
  description:
    "Learn advanced AtomHTTP features including cancellation (AbortController), multithreading and concurrency, streaming/download/pagination, interceptors, FormData uploads, caching, cookies, authentication, and proxy/TLS configuration.",
  keywords:
    "python http cancellation, abortcontroller python, python http concurrency, python http streaming, http interceptors python, upload progress python, download progress python, formdata python, http caching python, http authentication python",
  openGraph: {
    title: "Advanced Features - AtomHTTP",
    description:
      "Master AtomHTTP advanced features: interceptors, progress tracking, FormData, concurrent requests, authentication, and more.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Advanced Features - AtomHTTP",
    description:
      "Master AtomHTTP advanced features: interceptors, progress tracking, FormData, concurrent requests, and more.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AdvancedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
