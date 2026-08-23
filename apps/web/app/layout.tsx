import type { Metadata } from "next";
import "./theme.config.css";
import { Providers } from "@/components/app/providers";

export const metadata: Metadata = {
  title: "Smart Med Records | Medico-Legal Intelligence",
  description:
    "AI-assisted, physician-reviewed medical record solutions for stronger legal outcomes.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-ivory font-[Arial,Helvetica,sans-serif] text-ink selection:bg-[#b9ded5] selection:text-[#063f36]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
