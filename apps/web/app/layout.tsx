import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/app/providers";

export const metadata: Metadata = {
  title: "Smart Med Records | Medico-Legal Intelligence",
  description:
    "AI-assisted, physician-reviewed medical record solutions for stronger legal outcomes.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
