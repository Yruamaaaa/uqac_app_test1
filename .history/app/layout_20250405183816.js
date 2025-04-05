import { Fugaz_One, Open_Sans } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { AuthProvider } from "@/context/AuthContext";
import Head from "./head";
import Logout from "@/components/Logout";

const open_sans = Open_Sans({ subsets: ["latin"] });
const fugaz = Fugaz_One({ subsets: ["latin"], weight: ['400'], variable: '--font-fugaz' });

export const metadata = {
  title: "Shuk - Find Activities",
  description: "Helps you find activities",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head />
      <body className={`${fugaz.variable} font-sans w-full mx-auto text-sm sm:text-base min-h-screen flex flex-col text-slate-800 ${open_sans.className}`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
