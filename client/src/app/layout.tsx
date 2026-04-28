import type { Metadata } from "next";
import { Inter } from "next/font/google";
 import "./globals.css";
import ClientInit from "./ClientInit";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KonveksiKu - Custom Clothing Platform",
  description: "Platform pemesanan baju custom yang menghubungkan pelanggan dengan konveksi lokal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-navy-900 text-white min-h-screen`}>
        <Toaster position="top-right" />
        <ClientInit />
        {children}
      </body>
    </html>
  );
}
