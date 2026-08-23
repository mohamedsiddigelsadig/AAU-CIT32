import type { Metadata } from "next";
import { Cairo, IBM_Plex_Sans_Arabic, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/toast-provider";
import { ErrorBoundary } from "@/components/error-boundary";

const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo", weight: ["500", "600", "700", "800", "900"] });
const plexArabic = IBM_Plex_Sans_Arabic({ subsets: ["arabic", "latin"], variable: "--font-plex-arabic", weight: ["300", "400", "500", "600", "700"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  title: "بوابة دفعة 32 — كلية علوم الحاسوب وتقانة المعلومات",
  description: "نحو جيلٍ رقميٍّ مبدع، يوظف المعرفة والتقنية لصناعة المستقبل وقيادة التغيير.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} ${plexArabic.variable} ${spaceGrotesk.variable} font-body`}>
        <ErrorBoundary>
          <ThemeProvider>
            <ToastProvider>{children}</ToastProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
