import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "1111.TN — Inscription | La Police des Prix",
  description:
    "Rejoignez 1111.TN, la police des prix en Tunisie. Recevez les alertes prix, les meilleures promotions et soyez averti des fausses promotions.",
  icons: {
    icon: "/background.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#060b1c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
