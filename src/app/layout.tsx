import type { Metadata, Viewport } from "next";
import { LearningProvider } from "../components/learning-provider";
import { Shell } from "../components/layout/shell";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "CyberPath — Your path to network security",
    template: "%s | CyberPath",
  },
  description:
    "Learn network security through English lessons, Chinese vocabulary, and interactive simulations.",
  appleWebApp: { capable: true, title: "CyberPath", statusBarStyle: "default" },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1220",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <LearningProvider>
          <Shell>{children}</Shell>
        </LearningProvider>
      </body>
    </html>
  );
}
