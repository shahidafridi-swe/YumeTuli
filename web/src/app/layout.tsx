import type { Metadata } from "next";
import { Geist, Geist_Mono, Hind_Siliguri } from "next/font/google";
import { I18nProvider } from "@/i18n";
import { themeScript } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// Scripts and titles are often Bangla.
const bangla = Hind_Siliguri({ variable: "--font-bangla", subsets: ["bengali"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: { default: "YumeTuli", template: "%s · YumeTuli" },
  description: "Personal studio for vertical shorts",
};

// UI locale: English for now. When more languages exist, read the owner's choice here (cookie)
// inside a Suspense boundary and pass it to I18nProvider.
const LOCALE = "en";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={LOCALE}
      data-theme="system"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${bangla.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full font-sans">
        <I18nProvider locale={LOCALE}>{children}</I18nProvider>
      </body>
    </html>
  );
}
