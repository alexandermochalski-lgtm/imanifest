import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

/** UI body — geometric, screen-first (modern SaaS / fintech standard). */
const dmSans = DM_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

/** Display — contemporary geometric grotesk (cool product headlines). */
const spaceGrotesk = Space_Grotesk({
  variable: "--font-cormorant",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "iManifest University",
    template: "%s · iManifest University",
  },
  description:
    "iManifest University — personal finance, investing, and wealth creation. A modern campus for operators.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${dmSans.variable} ${spaceGrotesk.variable} dark h-full antialiased`}>
      <body className="mesh min-h-full">{children}</body>
    </html>
  );
}
