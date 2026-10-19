import type { Metadata } from "next";

import "./globals.css";

import Providers from "./providers";

export const metadata: Metadata = {
  title: "Godavari Basket Abroad | From Godavari, With Love",

  description:
    "Build a premium Godavari box with authentic regional favourites and send a little piece of home across the world.",

  metadataBase: new URL(
    "https://abroad.godavaribasket.com"
  ),

  openGraph: {
    title: "Godavari Basket Abroad",

    description:
      "From Godavari, With Love. Build your Godavari box for delivery abroad.",

    type: "website",

    images: ["/images/abroad/og.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
