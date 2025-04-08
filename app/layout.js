import { Fugaz_One, Open_Sans } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { AuthProvider } from "@/context/AuthContext";
import Head from "./head";
import Logout from "@/components/Logout";
import Notifications from '@/components/Notifications'
import { Toaster } from 'react-hot-toast'

const open_sans = Open_Sans({ subsets: ["latin"] });
const fugaz = Fugaz_One({ subsets: ["latin"], weight: ['400'] });

export const metadata = {
  title: "SHUK",
  description: "Track your daily activity every day of the year!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head />
      <body className={'w-full mx-auto text-sm sm:text-base min-h-screen flex flex-col text-slate-800 ' + open_sans.className}>
        <AuthProvider>
          {children}
          <Notifications />
          <Toaster position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
