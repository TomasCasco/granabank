import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { VersionSwitch } from "@/components/version-switch";
import { Providers } from "./providers";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: { default: "GranaBank", template: "%s · GranaBank" },
  description: "Con cada compra, sumás orgullo granate",
};

export const viewport: Viewport = {
  themeColor: "#7a1d2d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full">
        {/* The design is mobile-only: on wider screens the app sits in a centered phone-width column. */}
        <div className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-base shadow-soft">
          <Providers>{children}</Providers>
          <VersionSwitch />
        </div>
      </body>
    </html>
  );
}
