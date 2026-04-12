import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sports Scope — CMV Ranking",
  description:
    "Ranking Commercial Market Value (CMV) de futbolistas. Datos deportivos y sociales en una sola métrica.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="font-sans text-base leading-relaxed text-zinc-200 antialiased">
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <main className="relative w-full min-w-0 flex-1 overflow-x-hidden">
            <div
              className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35] [background-image:linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px)] [background-size:40px_40px]"
              aria-hidden
            />
            {children}
          </main>
          <footer className="border-t border-white/[0.1] py-8 text-center text-base leading-relaxed text-zinc-500 sm:py-10">
            Sports Scope · CMV es una estimación agregada. Datos con fines informativos.
          </footer>
        </div>
      </body>
    </html>
  );
}
