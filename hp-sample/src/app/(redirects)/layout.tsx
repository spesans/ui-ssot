import { Inter } from "next/font/google";
import "../globals.css";
import { getLanguageInitScript, getThemeInitScript } from "@/lib/inline-scripts";
import { DEFAULT_ROUTE_LANGUAGE } from "@/lib/locale";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const themeInitScript = getThemeInitScript();
const languageInitScript = getLanguageInitScript();

export default function RedirectLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={DEFAULT_ROUTE_LANGUAGE} className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: languageInitScript }} />
      </head>
      <body className="bg-background text-foreground font-sans selection:bg-primary selection:text-white">
        {children}
      </body>
    </html>
  );
}
