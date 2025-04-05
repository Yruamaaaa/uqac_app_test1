'use client'
import { Fugaz_One } from 'next/font/google'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Loading from '@/components/Loading'
import Calendar from '@/components/Calendar'

const fugaz = Fugaz_One({ subsets: ["latin"], weight: ['400'] })

// Dynamically import Button to avoid hydration issues
const Button = dynamic(() => import('@/components/Button'), {
    ssr: false,
    loading: () => <Loading />
})

export default function Home() {
    const { currentUser, loading } = useAuth()
    const router = useRouter()

    if (loading) {
        return <Loading />
    }

    return (
        <main className="min-h-screen flex flex-col items-center p-4 max-w-7xl mx-auto w-full">
            <div className="text-center space-y-6 mb-12">
                <h1 className={`text-6xl md:text-8xl ${fugaz.className}`}>
                    Shuk
                </h1>
                <p className="text-xl md:text-2xl text-gray-600">
                    helps you find activities
                </p>
                <div className="mt-8">
                    {currentUser ? (
                        <Button
                            text="Go to Dashboard"
                            onClick={() => router.push('/dashboard')}
                            full
                        />
                    ) : (
                        <Button
                            text="Login"
                            onClick={() => router.push('/login')}
                            full
                        />
                    )}
                </div>
            </div>

            <div className="w-full bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-semibold mb-6">Upcoming Events</h2>
                <Calendar defaultView="week" />
            </div>
        </main>
    )
}