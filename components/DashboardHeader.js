'use client'
import { Fugaz_One } from 'next/font/google'
import React from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const fugaz = Fugaz_One({ subsets: ["latin"], weight: ['400'] })

export default function DashboardHeader() {
    const { logout } = useAuth()
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await logout()
            router.push('/')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    return (
        <header className="sticky top-0 bg-white border-b border-gray-200 py-3 z-10">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center">
                        <Link href="/" className="flex items-center">
                            <h1 className={`text-xl sm:text-2xl lg:text-3xl ${fugaz.className}`}>SHUK</h1>
                        </Link>
                        <div className="flex items-center gap-4 lg:gap-6">
                            <button className="text-lg sm:text-xl lg:text-2xl hover:text-gray-700 transition-colors">
                                <i className="fa-regular fa-bell"></i>
                            </button>
                            <button 
                                onClick={handleLogout} 
                                className="text-lg sm:text-xl lg:text-2xl hover:text-gray-700 transition-colors"
                                title="Logout"
                            >
                                <i className="fa-solid fa-right-from-bracket"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
} 