import type { Metadata } from "next";
import { Instrument_Sans, League_Gothic } from "next/font/google";
import "./globals.css";

const leagueGothic = League_Gothic({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Skill Tracker | Weidert Group",
  description:
    "Everyone builds 3 Claude Skills by October. Track the agency rock, ship skills, and cheer each other on.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${leagueGothic.variable} ${instrumentSans.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
