import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getSiteSettings } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "LUXE — Premium Essentials",
    template: "%s · LUXE",
  },
  description:
    "Premium audio, wearables, and everyday essentials. Free carbon-neutral shipping, 30-day returns.",
  keywords: ["ecommerce", "premium", "headphones", "smartwatch", "minimal"],
  openGraph: {
    type: "website",
    title: "LUXE — Premium Essentials",
    description: "Premium gear, minimally designed.",
    url: appUrl,
    siteName: "LUXE",
    images: [{ url: "/og.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: "LUXE", description: "Premium gear, minimally designed." },
  robots: { index: true, follow: true },
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">
            Skip to content
          </a>
          <Navbar storeName={settings.store_name} />
          <main id="main" className="min-h-[60vh]">{children}</main>
          <Footer storeName={settings.store_name} tagline={settings.footer_tagline} />
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
