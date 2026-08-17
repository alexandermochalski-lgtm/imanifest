import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
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
    <html lang="en" className={`${jakarta.variable} ${cormorant.variable} dark h-full antialiased`}>
      <body className="mesh min-h-full">{children}</body>
    </html>
  );
}
