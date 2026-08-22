import type { Metadata } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import "./globals.css";

/** Body UI — clean geometric sans (replaces Plus Jakarta). */
const manrope = Manrope({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

/** Display headlines — contemporary serif (replaces Cormorant). */
const instrument = Instrument_Serif({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: "400",
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
    <html lang="en" className={`${manrope.variable} ${instrument.variable} dark h-full antialiased`}>
      <body className="mesh min-h-full">{children}</body>
    </html>
  );
}
