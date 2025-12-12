// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RamPotteryHub – Invoicing & Stock",
  description: "Internal invoicing & stock system for Ram Pottery Ltd",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="main-shell">
          <div className="main-container">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
