import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgencyOS — Find Clients. Close Projects.",
  description: "Autonomous AI agency operating system that finds businesses, analyzes their online presence, reaches out, converts them into clients and prepares complete project handoffs.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-[#f8f6f0] text-[#101413] antialiased">
        {children}
      </body>
    </html>
  );
}

