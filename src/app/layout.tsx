import type { Metadata } from "next";
import "./globals.css";

const SHARED_ICONS = "/sites/www-enigmascult-com-ddb923ee/shared/icons";

export const metadata: Metadata = {
  title: "Enigma – Sneaker Auctions, Mystery Boxes & Reborn Customs",
  description:
    "Enigma is the cult of authenticated streetwear: live sneaker auctions, style-coded mystery boxes and Reborn customs. Decode your style. Join the circle.",
  icons: {
    icon: [
      { url: `${SHARED_ICONS}/cropped-gradient-32x32.png`, sizes: "32x32" },
      { url: `${SHARED_ICONS}/cropped-gradient-192x192.png`, sizes: "192x192" },
    ],
    apple: [{ url: `${SHARED_ICONS}/cropped-gradient-180x180.png` }],
  },
  openGraph: {
    title: "Enigma – Sneaker Auctions, Mystery Boxes & Reborn Customs",
    description:
      "Enigma is the cult of authenticated streetwear: live sneaker auctions, style-coded mystery boxes and Reborn customs. Decode your style. Join the circle.",
    type: "website",
    locale: "en_US",
    siteName: "Enigma",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US" translate="no" className="home-loading">
      <body className="home wp-singular page-template-default page page-id-6 wp-embed-responsive wp-theme-enigma-cult theme-enigma-cult page-home">
        {children}
      </body>
    </html>
  );
}
