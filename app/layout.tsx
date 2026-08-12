import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "wardOS",
  description: "An operating dashboard for ward and quorum coordination.",
};

const directionContract = `<!--
THESIS: One page answers what Sunday needs. Refuses the metric-card row and the
boxed-card grid the admin-dashboard default ships.
OWN-WORLD: White field, near-black type, one cobalt accent (#1D4ED8). Hairline
dividers instead of boxes. DM Sans. Status colour is functional, never decorative.
Notion register: low chrome, type-led hierarchy, generous whitespace.
STORY: A presidency member opens wardOS and knows within seconds what is
unresolved before Sunday, who owns it, and what to do next.
FIRST VIEWPORT: Soft grey sidebar at left. Content reads as a document, not a
grid — page title, then This Sunday as one wide low-chrome band, then Needs
attention as a ruled list of unresolved items with owner and date.
FORM: Category standard. Canon exit taken by the owner after direction rolls
967762bc and 82ca8ac9.
FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, and DESIGN.md
-->`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body>
        <div dangerouslySetInnerHTML={{ __html: directionContract }} />
        {children}
      </body>
    </html>
  );
}
