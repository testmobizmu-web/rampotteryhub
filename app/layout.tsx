import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RamPotteryHub – Invoicing & Stock",
  description: "Internal invoicing & stock system for Ram Pottery Ltd",
  metadataBase: new URL("https://rampotteryhub.netlify.app"),
  applicationName: "RamPotteryHub",
  openGraph: {
    title: "RamPotteryHub – Invoicing & Stock",
    description: "Internal invoicing & stock system for Ram Pottery Ltd",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#b80000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="rp-html" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <link rel="preload" as="image" href="/images/logo/logo.png" />

        {/* ✅ Prevent theme flicker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  try {
    var t = localStorage.getItem("rp_theme");
    var isDark = (t === "dark");
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  } catch(e) {
    document.documentElement.setAttribute("data-theme", "light");
  }
})();`,
          }}
        />
      </head>

      <body className="rp-body">{children}</body>
    </html>
  );
}

