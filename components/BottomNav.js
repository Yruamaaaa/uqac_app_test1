'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center">
                        <Link 
                            href="/dashboard" 
                            className={`p-2 text-xl transition-colors ${pathname === '/dashboard' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Home"
                        >
                            <i className="fa-solid fa-house"></i>
                        </Link>
                        <Link 
                            href="/event-research"
                            className={`p-2 text-xl transition-colors ${pathname === '/event-research' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Search"
                        >
                            <i className="fa-solid fa-magnifying-glass"></i>
                        </Link>
                        <Link 
                            href="/create-event"
                            className={`p-2 text-xl transition-colors ${pathname === '/create-event' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Create Event"
                        >
                            <i className="fa-solid fa-plus"></i>
                        </Link>
                        <button 
                            className="p-2 text-xl text-gray-400 hover:text-gray-600 transition-colors"
                            title="Activity"
                        >
                            <i className="fa-solid fa-heart"></i>
                        </button>
                        <Link 
                            href="/profile"
                            className={`p-2 text-xl transition-colors ${pathname === '/profile' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Profile"
                        >
                            <i className="fa-solid fa-user"></i>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    )
} 