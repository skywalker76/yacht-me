import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "YACHT~ME | Noleggio Yacht e Barche - Riviera Sea Life",
  description:
    "Noleggio yacht, barche a vela, gommoni e moto d'acqua a Marina di Rimini. Esperienza di lusso sulla Riviera Romagnola.",
  keywords: [
    "noleggio yacht rimini",
    "charter barche rimini",
    "yacht me",
    "riviera sea life",
  ],
  openGraph: {
    title: "YACHT~ME | Riviera Sea Life",
    description: "Vivi il lusso del mare Adriatico. Noleggia yacht e barche dalla Marina di Rimini.",
    type: "website",
    locale: "it_IT",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${playfair.variable} ${inter.variable} antialiased`}>
        <ThemeProvider>
          <CookieConsentProvider>
            {children}
          </CookieConsentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

