import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import { RegisterServiceWorker } from "./register-service-worker";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const dmMono = DM_Mono({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-dm-mono",
});

export const metadata: Metadata = {
  title: "Habit Tracker",
  description:
    "A mobile-first habit tracker that runs entirely in your browser.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Habit Tracker",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c1222",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${dmMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="relative min-h-full flex flex-col font-sans"
        suppressHydrationWarning
      >
        <div
          className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
          aria-hidden
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_-15%,rgba(16,185,129,0.18),transparent_52%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_100%_50%,rgba(59,130,246,0.08),transparent_45%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_0%_80%,rgba(16,185,129,0.06),transparent_50%)]" />
        </div>
        {children}
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
