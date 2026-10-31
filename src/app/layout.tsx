import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CrowdPulse AI — Every moment has a crowd",
  description: "Community-powered live moments for Twitch creators.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
