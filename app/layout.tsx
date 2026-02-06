import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hour Voiceover Agent",
  description: "AI-powered voiceover generation for hour-long content",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
