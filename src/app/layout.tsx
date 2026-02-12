import type { Metadata } from "next";
import Link from "next/link";
import { Barlow_Condensed, Cormorant_Garamond, Space_Grotesk } from "next/font/google";

import { ModeNav } from "@/components/mode-nav";
import { PostHogBootstrap } from "@/components/posthog-bootstrap";
import { MVSConsole } from "@/components/system/console";

import "./globals.css";

const headline = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-headline",
});
const body = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
});
const literary = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-literary",
});

export const metadata: Metadata = {
  title: "ivi374ivi027-05 // MET4MORFOSES",
  description:
    "A digital representation of Anthony James Padavano's MFA thesis: MET4MORFOSES.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${headline.variable} ${body.variable} ${literary.variable}`}>
        <PostHogBootstrap />
        <MVSConsole />
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <a className="skip-link" href="#mode-navigation">
          Skip to mode navigation
        </a>
        <div className="bg-atmosphere" aria-hidden="true" />

        <header className="site-header">
          <div>
            <p className="eyebrow">MFA Thesis • 2018</p>
            <Link className="site-title" href="/">
              MET4MORFOSES
            </Link>
          </div>

          <ModeNav id="mode-navigation" />

          <nav aria-label="Secondary navigation" className="secondary-nav">
            <Link href="/archive">Archive</Link>
            <Link href="/about">About</Link>
          </nav>
        </header>

        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
