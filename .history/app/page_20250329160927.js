'use client'
import Hero from "@/components/Hero";
import { Fugaz_One } from "next/font/google";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const fugaz = Fugaz_One({ subsets: ["latin"], weight: ['400'] });

export default function HomePage() {
  const { currentUser, loading } = useAuth();

  return (
    <>
      <header className="p-4 sm:p-8 flex items-center justify-between gap-4">
        <Link href={'/'}>
          <h1 className={'text-base sm:text-lg textGradient ' + fugaz.className}>SHUK</h1>
        </Link>
        {!loading && (
          currentUser ? (
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className="text-blue-600 hover:text-blue-800">
              Login
            </Link>
          )
        )}
      </header>

      <main className="flex-1 flex flex-col">
        <Hero />
      </main>

      <footer className="p-4 sm:p-8 grid place-items-center">
        <p className={'text-black duration-200 hover:text-white hover:bg-black ' + fugaz.className}>
          Built by student for student
        </p>
      </footer>
    </>
  );
}