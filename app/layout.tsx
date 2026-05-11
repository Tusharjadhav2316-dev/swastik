import type { Metadata } from "next";
import { Orbitron, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import GlobalPlasma from "@/components/plasma/GlobalPlasma";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SWASTIK Neural Interface System",
  description: "Antigravity SWASTIK AI Interface",
};

export const viewport = {
  themeColor: "#060609",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased dark bg-black`}
      style={{ backgroundColor: '#000000' }}
    >
      <body className="min-h-screen w-screen flex flex-col bg-black text-white overflow-x-hidden" style={{ backgroundColor: '#000000' }}>
        <GlobalPlasma />
        {children}
      </body>
    </html>
  );
}
