import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Reality",
  description: "Phone-to-web capture system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-void text-white antialiased">
        {children}
      </body>
    </html>
  );
}
