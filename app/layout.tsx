import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Toaster } from "sonner";
import NameChangeProvider from "@/components/NameChangeProvider";
import { ThemeProvider } from "@/lib/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CineRate Rate Movies",
  description:
    "Rate and discover movies with the community. Multi-category rating system with real-time aggregation and personalized recommendations.",
  generator: "v0.app",
  applicationName: "CineRate",
  keywords: ["movies", "ratings", "reviews", "cinema", "film", "entertainment"],
  authors: [{ name: "CineRate Team" }],
  creator: "CineRate",
  publisher: "CineRate",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en">
        <body
          className={`${inter.variable} font-sans antialiased bg-background dark:bg-[#111317] text-foreground dark:text-gray-300`}
        >
          <ConvexClientProvider>
            <ThemeProvider>
              <div className="pb-16 md:pb-0">{children}</div>
            </ThemeProvider>
            <BottomNavigation />
            <NameChangeProvider />
          </ConvexClientProvider>
          <Toaster />
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
