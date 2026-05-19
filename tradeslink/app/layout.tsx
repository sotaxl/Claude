import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "TradesLink – Find Trusted Local Tradespeople",
    template: "%s | TradesLink",
  },
  description:
    "Connect with verified local tradespeople. Find electricians, plumbers, carpenters, roofers and more. Book online, chat directly, read reviews.",
  keywords: ["electrician", "plumber", "carpenter", "roofer", "local trades", "book tradesperson"],
  openGraph: {
    type: "website",
    title: "TradesLink – Find Trusted Local Tradespeople",
    description: "Connect with verified local tradespeople near you.",
    siteName: "TradesLink",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
