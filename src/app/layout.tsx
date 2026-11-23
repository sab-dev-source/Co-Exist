import type { Metadata } from "next";
import "./globals.css";

const SHARED_ICONS = "/sites/www-enigmascult-com-ddb923ee/shared/icons";

export const metadata: Metadata = {
  title: "Co-Exist – Karachi Chapter, Mystery Boxes & Streetwear Silhouettes",
  description:
    "Co-Exist is Karachi's cult of heavyweight streetwear silhouettes, style-coded mystery boxes, and 021 heritage drops. Decode your style. Join the Inner Circle.",
  icons: {
    icon: [
      { url: `${SHARED_ICONS}/cropped-gradient-32x32.png`, sizes: "32x32" },
      { url: `${SHARED_ICONS}/cropped-gradient-192x192.png`, sizes: "192x192" },
    ],
    apple: [{ url: `${SHARED_ICONS}/cropped-gradient-180x180.png` }],
  },
  openGraph: {
    title: "Co-Exist – Karachi Chapter, Mystery Boxes & Streetwear Silhouettes",
    description:
      "Co-Exist is Karachi's cult of heavyweight streetwear silhouettes, style-coded mystery boxes, and 021 heritage drops. Decode your style. Join the Inner Circle.",
    type: "website",
    locale: "en_US",
    siteName: "Co-Exist",
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
