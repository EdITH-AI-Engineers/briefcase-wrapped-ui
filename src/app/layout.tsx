import type { Metadata } from "next";
import { Figtree, Montserrat, Lora, Hind_Madurai } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree"
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat"
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora"
});

const hindMaduria = Hind_Madurai({
  subsets: ["latin"],
  variable: "--font-hind",
  weight: "300"
});

export const metadata: Metadata = {
  title: "Briefcase · Career Readiness",
  description: "Your Briefcase career-readiness dashboard and Wrapped recap.",
  icons: { icon: "/briefcase-logo.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${montserrat.variable} ${lora.variable} ${hindMaduria.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
