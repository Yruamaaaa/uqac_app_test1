'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
    const { currentUser } = useAuth()
    const router = useRouter()

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
            <div className="text-center space-y-6">
                <h1 className="text-6xl md:text-8xl font-fugaz text-blue-600">
                    Shuk
                </h1>
                <p className="text-xl md:text-2xl text-gray-600">
                    Helps you find activities
                </p>
                
                <div className="mt-8">
                    {currentUser ? (
                        <Link 
                            href="/dashboard"
                            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Go to Dashboard
                        </Link>
                    ) : (
                        <Link 
                            href="/login"
                            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}