import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { brand } from "@/config/brand";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: brand.productName,
  description: brand.tagline,
  icons: {
    icon: "/favicon.svg",
  },
};

/** Native browser zoom: pin layout to the device width and avoid iOS font inflation. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="font-sans antialiased bg-canvas min-h-dvh min-h-0 overflow-x-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
