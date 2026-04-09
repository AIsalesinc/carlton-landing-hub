import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RevFirma | Carlton Landing Hub",
  description:
    "Your centralized source for Carlton Landing, Oklahoma news, community events, and restaurant hours on Lake Eufaula.",
  openGraph: {
    title: "RevFirma | Carlton Landing Hub",
    description: "News, events & dining in Carlton Landing, OK",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
