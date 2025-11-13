import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ジャーナリングアプリ",
  description: "自己を見つめ、思考を整理するジャーナリングアプリ",
  manifest: "/manifest.json",
  themeColor: "#FF9966",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
